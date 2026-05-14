import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { authenticate, AuthRequest } from "../middleware/auth";

const JWT_SECRET = process.env.JWT_SECRET || "inventariopyme-dev-secret";
const router = Router();

const registerSchema = z.object({
  companyName: z.string().min(2, "Nombre de empresa requerido"),
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

const createUserSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["owner", "bodega", "compras", "contador"]),
});

router.post("/register", async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      res.status(400).json({ error: "El email ya está registrado" });
      return;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const company = await prisma.company.create({
      data: {
        name: data.companyName,
        users: {
          create: {
            email: data.email,
            password: hashedPassword,
            name: data.name,
            role: "owner",
          },
        },
      },
      include: { users: true },
    });

    const user = company.users[0];
    const token = jwt.sign(
      { userId: user.id, companyId: company.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      company: { id: company.id, name: company.name },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { company: true },
    });

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      res.status(401).json({ error: "Credenciales inválidas" });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, companyId: user.companyId, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      company: { id: user.company.id, name: user.company.name },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { company: true },
    });
    if (!user) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }
    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      company: { id: user.company.id, name: user.company.name },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/users", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== "owner") {
      res.status(403).json({ error: "Solo el dueño puede crear usuarios" });
      return;
    }
    const data = createUserSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      res.status(400).json({ error: "El email ya está registrado" });
      return;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        companyId: req.user!.companyId,
      },
    });

    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export { router as authRouter };
