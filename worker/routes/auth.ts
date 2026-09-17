import { Hono } from "hono";
import { signJWT, hashPassword, verifyPassword, generateOTP, generateResetToken, generateId } from "../auth";
import { authMiddleware } from "../middleware";
import type { Env, Variables } from "../types";

export const authRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

authRoutes.post("/register", async (c) => {
  const { email, password } = await c.req.json<{ email: string; password: string }>();
  if (!email || !password) return c.json({ error: "Email and password required" }, 400);

  const existing = await c.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
  if (existing) return c.json({ error: "Email already registered" }, 409);

  const id = generateId();
  const passwordHash = await hashPassword(password);
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await c.env.DB.prepare("INSERT INTO users (id, email, password_hash, role, otp_code, otp_expires) VALUES (?, ?, ?, 'admin', ?, ?)").bind(id, email, passwordHash, otp, otpExpiry).run();

  // In production, send OTP via email. For now, return it in response.
  return c.json({ message: "Registration successful. OTP sent to email.", otp_dev: otp });
});

authRoutes.post("/verify-otp", async (c) => {
  const { email, otpCode } = await c.req.json<{ email: string; otpCode: string }>();
  const user = await c.env.DB.prepare("SELECT id, otp_code, otp_expires FROM users WHERE email = ?").bind(email).first<{ id: string; otp_code: string; otp_expires: string }>();
  if (!user) return c.json({ error: "User not found" }, 404);

  if (new Date(user.otp_expires) < new Date()) return c.json({ error: "OTP expired" }, 400);
  if (user.otp_code !== otpCode) return c.json({ error: "Invalid OTP" }, 400);

  await c.env.DB.prepare("UPDATE users SET otp_code = NULL, otp_expires = NULL, verified = 1 WHERE id = ?").bind(user.id).run();
  const token = await signJWT({ sub: user.id, role: "admin" }, c.env.JWT_SECRET);
  return c.json({ access_token: token });
});

authRoutes.post("/resend-otp", async (c) => {
  const { email } = await c.req.json<{ email: string }>();
  const user = await c.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first<{ id: string }>();
  if (!user) return c.json({ message: "If account exists, OTP resent" });

  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  await c.env.DB.prepare("UPDATE users SET otp_code = ?, otp_expires = ? WHERE id = ?").bind(otp, otpExpiry, user.id).run();
  return c.json({ message: "OTP resent", otp_dev: otp });
});

authRoutes.post("/loginViaEmailPassword", async (c) => {
  const { email, password } = await c.req.json<{ email: string; password: string }>();
  const user = await c.env.DB.prepare("SELECT id, password_hash, role FROM users WHERE email = ?").bind(email).first<{ id: string; password_hash: string; role: string }>();
  if (!user) return c.json({ error: "Invalid email or password" }, 401);

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return c.json({ error: "Invalid email or password" }, 401);

  const token = await signJWT({ sub: user.id, role: user.role }, c.env.JWT_SECRET);
  return c.json({ access_token: token, user: { id: user.id, email, role: user.role } });
});

authRoutes.post("/login", async (c) => {
  const { email, password } = await c.req.json<{ email: string; password: string }>();
  const user = await c.env.DB.prepare("SELECT id, password_hash, role FROM users WHERE email = ?").bind(email).first<{ id: string; password_hash: string; role: string }>();
  if (!user) return c.json({ error: "Invalid email or password" }, 401);

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return c.json({ error: "Invalid email or password" }, 401);

  const token = await signJWT({ sub: user.id, role: user.role }, c.env.JWT_SECRET);
  return c.json({ access_token: token, user: { id: user.id, email, role: user.role } });
});

authRoutes.get("/me", authMiddleware, async (c) => {
  const userId = c.get("userId");
  const user = await c.env.DB.prepare("SELECT id, email, role FROM users WHERE id = ?").bind(userId).first<{ id: string; email: string; role: string }>();
  if (!user) return c.json({ error: "User not found" }, 404);
  return c.json(user);
});

authRoutes.post("/logout", (c) => {
  return c.json({ message: "Logged out" });
});

authRoutes.post("/resetPasswordRequest", async (c) => {
  const { email } = await c.req.json<{ email: string }>();
  const user = await c.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first<{ id: string }>();
  if (!user) return c.json({ message: "If account exists, reset link sent" });

  const resetToken = generateResetToken();
  const resetExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  await c.env.DB.prepare("UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?").bind(resetToken, resetExpiry, user.id).run();
  // In production, send email with reset link
  return c.json({ message: "If account exists, reset link sent", reset_token_dev: resetToken });
});

authRoutes.post("/resetPassword", async (c) => {
  const { resetToken, newPassword } = await c.req.json<{ resetToken: string; newPassword: string }>();
  if (!resetToken || !newPassword) return c.json({ error: "Token and new password required" }, 400);

  const user = await c.env.DB.prepare("SELECT id, reset_expires FROM users WHERE reset_token = ?").bind(resetToken).first<{ id: string; reset_expires: string }>();
  if (!user) return c.json({ error: "Invalid reset token" }, 400);
  if (new Date(user.reset_expires) < new Date()) return c.json({ error: "Reset token expired" }, 400);

  const passwordHash = await hashPassword(newPassword);
  await c.env.DB.prepare("UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?").bind(passwordHash, user.id).run();
  return c.json({ message: "Password reset successful" });
});
