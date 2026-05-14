import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth";
import { productsRouter } from "./routes/products";
import { movementsRouter } from "./routes/movements";
import { alertsRouter } from "./routes/alerts";
import { dashboardRouter } from "./routes/dashboard";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/movements", movementsRouter);
app.use("/api/alerts", alertsRouter);
app.use("/api/dashboard", dashboardRouter);

app.listen(PORT, () => {
  console.log(`InventarioPYME API running on http://localhost:${PORT}`);
});

export default app;
