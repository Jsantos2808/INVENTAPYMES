import { Router, Response } from "express";
import { prisma } from "../utils/prisma";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authenticate);

export async function checkAndCreateAlert(
  productId: string,
  currentStock: number
): Promise<void> {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.minStock <= 0) return;

  if (currentStock < product.minStock && !product.alertActive) {
    await prisma.alert.create({
      data: {
        productId,
        currentStock,
        minStock: product.minStock,
        sent: true,
      },
    });
    await prisma.product.update({
      where: { id: productId },
      data: { alertActive: true },
    });
    console.log(
      `⚠️ ALERTA: ${product.name} (SKU: ${product.sku}) - Stock: ${currentStock} < Mínimo: ${product.minStock}`
    );
  }
}

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const alerts = await prisma.alert.findMany({
      where: {
        product: { companyId: req.user!.companyId },
      },
      include: {
        product: { select: { name: true, sku: true, stock: true, minStock: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json(alerts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener alertas" });
  }
});

router.get("/active", async (req: AuthRequest, res: Response) => {
  try {
    const alerts = await prisma.alert.findMany({
      where: {
        product: { companyId: req.user!.companyId },
        resolved: false,
      },
      include: {
        product: { select: { name: true, sku: true, stock: true, minStock: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(alerts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener alertas activas" });
  }
});

export { router as alertsRouter };
