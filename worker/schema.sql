-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  verified INTEGER DEFAULT 0,
  otp_code TEXT,
  otp_expires TEXT,
  reset_token TEXT,
  reset_expires TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Site settings (singleton - one row)
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY,
  owner_name TEXT DEFAULT '',
  location TEXT DEFAULT '',
  hero_title TEXT DEFAULT '',
  hero_intro TEXT DEFAULT '',
  show_name INTEGER DEFAULT 1,
  show_location INTEGER DEFAULT 1,
  show_time INTEGER DEFAULT 1,
  show_kind INTEGER DEFAULT 1,
  theme_mode TEXT DEFAULT 'light',
  heading_font TEXT DEFAULT 'source-serif',
  body_font TEXT DEFAULT 'inter',
  font_size TEXT DEFAULT 'normal',
  content_width TEXT DEFAULT 'normal',
  corner_radius TEXT DEFAULT 'soft',
  spacing TEXT DEFAULT 'normal',
  image_size TEXT DEFAULT 'normal',
  link_style TEXT DEFAULT 'card',
  accent_color TEXT DEFAULT '#4A5E4A',
  background_color TEXT DEFAULT '#FCFAF8',
  text_color TEXT DEFAULT '#1A1A1A'
);

-- Sections table
CREATE TABLE IF NOT EXISTS sections (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  kind TEXT DEFAULT 'custom',
  "order" INTEGER DEFAULT 0,
  enabled INTEGER DEFAULT 1,
  blocks TEXT DEFAULT '[]',
  created_date TEXT DEFAULT (datetime('now')),
  updated_date TEXT DEFAULT (datetime('now'))
);

-- Insert default site settings row
INSERT OR IGNORE INTO site_settings (id) VALUES ('default');
