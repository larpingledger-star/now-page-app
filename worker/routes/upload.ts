import { Hono } from "hono";
import { authMiddleware } from "../middleware";
import type { Env, Variables } from "../types";

export const uploadRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

uploadRoutes.post("/", authMiddleware, async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return c.json({ error: "No file provided" }, 400);

  const ext = file.name.split(".").pop() || "bin";
  const key = `uploads/${crypto.randomUUID()}.${ext}`;

  await c.env.BUCKET.put(key, file, {
    httpMetadata: { contentType: file.type },
  });

  const origin = new URL(c.req.url).origin;
  const url = `${origin}/api/files/${key}`;
  return c.json({ file_url: url });
});

// Public file serving
export const fileRoutes = new Hono<{ Bindings: Env }>();

fileRoutes.get("/*", async (c) => {
  const path = c.req.path.replace("/api/files/", "");
  const object = await c.env.BUCKET.get(path);
  if (!object) return c.text("Not found", 404);

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Cache-Control", "public, max-age=31536000");
  return new Response(object.body, { headers });
});
