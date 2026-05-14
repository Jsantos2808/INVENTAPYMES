import { Router, Response } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authenticate);

const productSchema = z.object({
  sku: z.string().min(1, "SKU requerido"),
  name: z.string().min(1, "Nombre requerido"),
  category: z.string().default(""),
  unit: z.string().default("unidad"),
  costPrice: z.number().min(0, "El precio debe ser positivo").default(0),
  minStock: z.number().int().min(0, "El stock mínimo debe ser positivo").default(0),
});

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().optional(),
  unit: z.string().optional(),
  costPrice: z.number().min(0).optional(),
  minStock: z.number().int().min(0).optional(),
});

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const category = typeof req.query.category === "string" ? req.query.category : undefined;

    const where: Record<string, unknown> = { companyId: req.user!.companyId };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
      ];
    }
    if (category) {
      where.category = category;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { name: "asc" },
    });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const product = await prisma.product.findFirst({
      where: { id, companyId: req.user!.companyId },
      include: {
        movements: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { user: { select: { name: true } } },
        },
      },
    });
    if (!product) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener producto" });
  }
});

router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const data = productSchema.parse(req.body);
    const existing = await prisma.product.findFirst({
      where: { sku: data.sku, companyId: req.user!.companyId },
    });
    if (existing) {
      res.status(400).json({ error: "Ya existe un producto con ese SKU" });
      return;
    }

    const product = await prisma.product.create({
      data: { ...data, companyId: req.user!.companyId },
    });
    res.status(201).json(product);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Error al crear producto" });
  }
});

router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const data = updateProductSchema.parse(req.body);
    const product = await prisma.product.findFirst({
      where: { id, companyId: req.user!.companyId },
    });
    if (!product) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }

    const updated = await prisma.product.update({
      where: { id },
      data,
    });
    res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const product = await prisma.product.findFirst({
      where: { id, companyId: req.user!.companyId },
    });
    if (!product) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }

    await prisma.product.delete({ where: { id } });
    res.json({ message: "Producto eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

export { router as productsRouter };
