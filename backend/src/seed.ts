import bcrypt from "bcryptjs";
import { prisma } from "./utils/prisma";

async function seed() {
  console.log("🌱 Seeding database...");

  await prisma.alert.deleteMany();
  await prisma.movement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);

  const company = await prisma.company.create({
    data: {
      name: "Ferretería El Martillo",
      users: {
        create: [
          {
            email: "admin@inventariopyme.com",
            password: hashedPassword,
            name: "Carlos Martínez",
            role: "owner",
          },
          {
            email: "bodega@inventariopyme.com",
            password: hashedPassword,
            name: "María López",
            role: "bodega",
          },
          {
            email: "compras@inventariopyme.com",
            password: hashedPassword,
            name: "Pedro Sánchez",
            role: "compras",
          },
        ],
      },
    },
    include: { users: true },
  });

  const products = await Promise.all([
    prisma.product.create({
      data: {
        sku: "CLAV-001",
        name: "Clavos 2 pulgadas (caja)",
        category: "Ferretería",
        unit: "caja",
        costPrice: 45.5,
        stock: 150,
        minStock: 20,
        companyId: company.id,
      },
    }),
    prisma.product.create({
      data: {
        sku: "MART-001",
        name: "Martillo de acero 16oz",
        category: "Herramientas",
        unit: "unidad",
        costPrice: 189.0,
        stock: 35,
        minStock: 5,
        companyId: company.id,
      },
    }),
    prisma.product.create({
      data: {
        sku: "PINT-001",
        name: "Pintura blanca látex (galón)",
        category: "Pinturas",
        unit: "galón",
        costPrice: 320.0,
        stock: 8,
        minStock: 10,
        alertActive: true,
        companyId: company.id,
      },
    }),
    prisma.product.create({
      data: {
        sku: "TORN-001",
        name: "Tornillos 3/8 (bolsa 100)",
        category: "Ferretería",
        unit: "bolsa",
        costPrice: 65.0,
        stock: 200,
        minStock: 30,
        companyId: company.id,
      },
    }),
    prisma.product.create({
      data: {
        sku: "CINT-001",
        name: "Cinta métrica 5m Stanley",
        category: "Herramientas",
        unit: "unidad",
        costPrice: 125.0,
        stock: 15,
        minStock: 3,
        companyId: company.id,
      },
    }),
  ]);

  const owner = company.users.find((u) => u.role === "owner")!;
  await prisma.movement.createMany({
    data: [
      {
        type: "entrada",
        quantity: 100,
        supplier: "Distribuidora Nacional",
        productId: products[0].id,
        userId: owner.id,
      },
      {
        type: "salida",
        quantity: 5,
        reason: "venta",
        productId: products[1].id,
        userId: owner.id,
      },
    ],
  });

  await prisma.alert.create({
    data: {
      productId: products[2].id,
      currentStock: 8,
      minStock: 10,
      sent: true,
    },
  });

  console.log("✅ Seed complete!");
  console.log(`   Company: ${company.name}`);
  console.log(`   Users: ${company.users.length}`);
  console.log(`   Products: ${products.length}`);
  console.log("\n📧 Login credentials:");
  console.log("   admin@inventariopyme.com / password123 (owner)");
  console.log("   bodega@inventariopyme.com / password123 (bodega)");
  console.log("   compras@inventariopyme.com / password123 (compras)");
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
