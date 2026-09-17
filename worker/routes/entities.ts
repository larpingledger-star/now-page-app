import { Hono } from "hono";
import { authMiddleware, adminMiddleware } from "../middleware";
import type { Env, Variables } from "../types";

export const entityRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// Public: get site settings
entityRoutes.get("/SiteSetting", async (c) => {
  const rows = await c.env.DB.prepare("SELECT * FROM site_settings ORDER BY id LIMIT 1").all();
  return c.json(rows.results || []);
});

// Public: get sections (filtered by enabled)
entityRoutes.get("/Section", async (c) => {
  const enabled = c.req.query("enabled");
  let query = "SELECT * FROM sections";
  const params: string[] = [];
  if (enabled === "true") {
    query += " WHERE enabled = 1";
  }
  query += " ORDER BY \"order\" ASC";
  const rows = await c.env.DB.prepare(query).bind(...params).all();
  return c.json(rows.results || []);
});

// Admin: get all sections
entityRoutes.get("/Section/all", authMiddleware, adminMiddleware, async (c) => {
  const rows = await c.env.DB.prepare("SELECT * FROM sections ORDER BY \"order\" ASC").all();
  return c.json(rows.results || []);
});

// Admin: create section
entityRoutes.post("/Section", authMiddleware, adminMiddleware, async (c) => {
  const body = await c.req.json<{ title: string; subtitle?: string; kind?: string; order?: number; enabled?: boolean; blocks?: unknown[] }>();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await c.env.DB.prepare(
    "INSERT INTO sections (id, title, subtitle, kind, \"order\", enabled, blocks, created_date, updated_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(id, body.title, body.subtitle || "", body.kind || "custom", body.order ?? 0, body.enabled ? 1 : 0, JSON.stringify(body.blocks || []), now, now).run();
  const section = await c.env.DB.prepare("SELECT * FROM sections WHERE id = ?").bind(id).first();
  return c.json(section);
});

// Admin: bulk update sections (reorder)
entityRoutes.put("/Section/bulk", authMiddleware, adminMiddleware, async (c) => {
  const items = await c.req.json<{ id: string; order?: number; enabled?: boolean }[]>();
  const stmts = items.map((item) => {
    const sets: string[] = [];
    const vals: unknown[] = [];
    if (item.order !== undefined) { sets.push("\"order\" = ?"); vals.push(item.order); }
    if (item.enabled !== undefined) { sets.push("enabled = ?"); vals.push(item.enabled ? 1 : 0); }
    vals.push(item.id);
    return c.env.DB.prepare(`UPDATE sections SET ${sets.join(", ")} WHERE id = ?`).bind(...vals);
  });
  await c.env.DB.batch(stmts);
  return c.json({ message: "Bulk update successful" });
});

// Admin: update section
entityRoutes.put("/Section/:id", authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<{ title?: string; subtitle?: string; kind?: string; order?: number; enabled?: boolean; blocks?: unknown[] }>();
  const now = new Date().toISOString();
  const sets: string[] = ["updated_date = ?"];
  const vals: unknown[] = [now];
  if (body.title !== undefined) { sets.push("title = ?"); vals.push(body.title); }
  if (body.subtitle !== undefined) { sets.push("subtitle = ?"); vals.push(body.subtitle); }
  if (body.kind !== undefined) { sets.push("kind = ?"); vals.push(body.kind); }
  if (body.order !== undefined) { sets.push("\"order\" = ?"); vals.push(body.order); }
  if (body.enabled !== undefined) { sets.push("enabled = ?"); vals.push(body.enabled ? 1 : 0); }
  if (body.blocks !== undefined) { sets.push("blocks = ?"); vals.push(JSON.stringify(body.blocks)); }
  vals.push(id);
  await c.env.DB.prepare(`UPDATE sections SET ${sets.join(", ")} WHERE id = ?`).bind(...vals).run();
  const section = await c.env.DB.prepare("SELECT * FROM sections WHERE id = ?").bind(id).first();
  return c.json(section);
});

// Admin: delete section
entityRoutes.delete("/Section/:id", authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM sections WHERE id = ?").bind(id).run();
  return c.json({ message: "Deleted" });
});

// Admin: update site settings
entityRoutes.put("/SiteSetting/:id", authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<Record<string, unknown>>();
  const allowed = [
    "owner_name", "location", "hero_title", "hero_intro",
    "show_name", "show_location", "show_time", "show_kind",
    "theme_mode", "heading_font", "body_font", "font_size",
    "content_width", "corner_radius", "spacing", "image_size",
    "link_style", "accent_color", "background_color", "text_color",
  ];
  const sets: string[] = [];
  const vals: unknown[] = [];
  for (const key of allowed) {
    if (body[key] !== undefined) {
      sets.push(`"${key}" = ?`);
      vals.push(typeof body[key] === "boolean" ? (body[key] ? 1 : 0) : body[key]);
    }
  }
  if (sets.length === 0) return c.json(body);
  vals.push(id);
  await c.env.DB.prepare(`UPDATE site_settings SET ${sets.join(", ")} WHERE id = ?`).bind(...vals).run();
  const row = await c.env.DB.prepare("SELECT * FROM site_settings WHERE id = ?").bind(id).first();
  return c.json(row);
});

// Admin: create site settings
entityRoutes.post("/SiteSetting", authMiddleware, adminMiddleware, async (c) => {
  const body = await c.req.json<Record<string, unknown>>();
  const id = crypto.randomUUID();
  const cols = ["id", ...Object.keys(body)];
  const placeholders = cols.map(() => "?").join(", ");
  const vals = [id, ...Object.values(body).map((v) => (typeof v === "boolean" ? (v ? 1 : 0) : v))];
  await c.env.DB.prepare(`INSERT INTO site_settings (${cols.map((c) => `"${c}"`).join(", ")}) VALUES (${placeholders})`).bind(...vals).run();
  const row = await c.env.DB.prepare("SELECT * FROM site_settings WHERE id = ?").bind(id).first();
  return c.json(row);
});
