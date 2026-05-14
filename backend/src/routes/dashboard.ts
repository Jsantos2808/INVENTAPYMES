import { Router, Response } from "express";
import { prisma } from "../utils/prisma";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [products, criticalProducts, todayMovements] =
      await Promise.all([
        prisma.product.count({ where: { companyId } }),
        prisma.product.count({
          where: { companyId, alertActive: true },
        }),
        prisma.movement.count({
          where: {
            product: { companyId },
            createdAt: { gte: today },
          },
        }),
      ]);

    const allProducts = await prisma.product.findMany({
      where: { companyId },
      select: { stock: true, costPrice: true },
    });
    const inventoryValue = allProducts.reduce(
      (sum, p) => sum + p.stock * p.costPrice,
      0
    );

    const criticalProductsList = await prisma.product.findMany({
      where: { companyId, alertActive: true },
      select: { id: true, name: true, sku: true, stock: true, minStock: true },
      take: 10,
    });

    res.json({
      totalProducts: products,
      criticalProducts,
      todayMovements,
      inventoryValue: Math.round(inventoryValue * 100) / 100,
      criticalProductsList,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener dashboard" });
  }
});

export { router as dashboardRouter };
