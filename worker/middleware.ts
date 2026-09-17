import { createMiddleware } from "hono/factory";
import { verifyJWT } from "./auth";
import type { Env, Variables } from "./types";

export const authMiddleware = createMiddleware<{ Bindings: Env; Variables: Variables }>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const token = authHeader.slice(7);
  const payload = await verifyJWT(token, c.env.JWT_SECRET);
  if (!payload || !payload.sub) {
    return c.json({ error: "Invalid token" }, 401);
  }
  c.set("userId", payload.sub as string);
  c.set("userRole", (payload.role as string) || "user");
  await next();
});

export const adminMiddleware = createMiddleware<{ Bindings: Env; Variables: Variables }>(async (c, next) => {
  if (c.get("userRole") !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }
  await next();
});
