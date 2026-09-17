import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRoutes } from "./routes/auth";
import { entityRoutes } from "./routes/entities";
import { uploadRoutes, fileRoutes } from "./routes/upload";

const app = new Hono();

app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

app.route("/api/auth", authRoutes);
app.route("/api/entities", entityRoutes);
app.route("/api/upload", uploadRoutes);
app.route("/api/files", fileRoutes);

app.get("/api/health", (c) => c.json({ ok: true }));

export default app;
