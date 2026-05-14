import { Router, Response } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { authenticate, AuthRequest } from "../middleware/auth";
import { checkAndCreateAlert } from "./alerts";

const router = Router();
router.use(authenticate);

const movementSchema = z.object({
  productId: z.string().uuid("ID de producto inválido"),
  type: z.enum(["entrada", "salida"]),
  quantity: z.number().int().positive("La cantidad debe ser mayor a cero"),
  reason: z.string().default(""),
  supplier: z.string().default(""),
});

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const { productId, type, from, to } = req.query;
    const where: Record<string, unknown> = {
      product: { companyId: req.user!.companyId },
    };

    if (productId) where.productId = String(productId);
    if (type) where.type = String(type);
    if (from || to) {
      where.createdAt = {};
      if (from) (where.createdAt as Record<string, unknown>).gte = new Date(String(from));
      if (to) (where.createdAt as Record<string, unknown>).lte = new Date(String(to));
    }

    const movements = await prisma.movement.findMany({
      where,
      include: {
        product: { select: { name: true, sku: true } },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json(movements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener movimientos" });
  }
});

router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const data = movementSchema.parse(req.body);

    const product = await prisma.product.findFirst({
      where: { id: data.productId, companyId: req.user!.companyId },
    });
    if (!product) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }

    if (data.type === "salida" && product.stock < data.quantity) {
      res.status(400).json({
        error: `Stock insuficiente. Stock actual: ${product.stock}`,
      });
      return;
    }

    const newStock =
      data.type === "entrada"
        ? product.stock + data.quantity
        : product.stock - data.quantity;

    const [movement] = await prisma.$transaction([
      prisma.movement.create({
        data: {
          type: data.type,
          quantity: data.quantity,
          reason: data.reason,
          supplier: data.supplier,
          productId: data.productId,
          userId: req.user!.userId,
        },
        include: {
          product: { select: { name: true, sku: true } },
          user: { select: { name: true } },
        },
      }),
      prisma.product.update({
        where: { id: data.productId },
        data: { stock: newStock },
      }),
    ]);

    if (data.type === "salida") {
      await checkAndCreateAlert(data.productId, newStock);
    }

    if (data.type === "entrada" && product.alertActive && newStock >= product.minStock) {
      await prisma.product.update({
        where: { id: data.productId },
        data: { alertActive: false },
      });
      await prisma.alert.updateMany({
        where: { productId: data.productId, resolved: false },
        data: { resolved: true },
      });
    }

    res.status(201).json({
      ...movement,
      newStock,
      message:
        data.type === "entrada"
          ? "Entrada registrada correctamente"
          : "Salida registrada correctamente",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Error al registrar movimiento" });
  }
});

export { router as movementsRouter };
