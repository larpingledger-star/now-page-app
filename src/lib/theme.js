export const HEADING_FONTS = [
  { value: "source-serif", label: "Source Serif 4", css: "'Source Serif 4', Georgia, 'Times New Roman', serif" },
  { value: "newsreader", label: "Newsreader", css: "'Newsreader', Georgia, serif" },
  { value: "fraunces", label: "Fraunces", css: "'Fraunces', Georgia, serif" },
  { value: "playfair", label: "Playfair Display", css: "'Playfair Display', Georgia, serif" },
];

export const BODY_FONTS = [
  { value: "inter", label: "Inter", css: "'Inter', ui-sans-serif, system-ui, sans-serif" },
  { value: "instrument", label: "Instrument Sans", css: "'Instrument Sans', ui-sans-serif, system-ui, sans-serif" },
];

export const DEFAULT_COLORS = {
  accent: "#4A5E4A",
  background: "#FCFAF8",
  text: "#1A1A1A",
};

const DARK_DEFAULTS = { background: "#171717", text: "#EBEBEB" };

const RADIUS = { sharp: "0.2rem", soft: "0.625rem", rounded: "1rem" };

function hexToHsl(hex) {
  let h = (hex || "").replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hue = 0;
  let sat = 0;
  const light = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    sat = light > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) hue = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue *= 60;
  }
  return { h: hue, s: sat * 100, l: light * 100 };
}

const css = ({ h, s, l }) => `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;

function isCustom(value, fallback) {
  return (
    typeof value === "string" &&
    value.trim() !== "" &&
    value.toLowerCase() !== fallback.toLowerCase()
  );
}

/**
 * Builds the inline CSS custom properties that skin the public site
 * from the saved SiteSetting values. Anything left at its default is
 * skipped so the design tokens in index.css stay in charge.
 */
export function buildThemeStyle(settings, isDark) {
  const s = settings || {};
  const style = { colorScheme: isDark ? "dark" : "light" };

  const heading = HEADING_FONTS.find((f) => f.value === s.heading_font);
  if (heading) {
    style["--font-heading"] = heading.css;
    style["--font-display"] = heading.css;
  }
  const body = BODY_FONTS.find((f) => f.value === s.body_font);
  if (body) style["--font-body"] = body.css;

  if (RADIUS[s.corner_radius]) style["--radius"] = RADIUS[s.corner_radius];

  if (isCustom(s.accent_color, DEFAULT_COLORS.accent)) {
    const a = hexToHsl(s.accent_color);
    const l = isDark ? Math.max(a.l, 55) : Math.min(a.l, 70);
    const primary = css({ ...a, l });
    style["--primary"] = primary;
    style["--ring"] = primary;
    style["--primary-foreground"] =
      l > 55 ? css({ h: a.h, s: Math.min(a.s, 30), l: 10 }) : "40 33% 98%";
  }

  const bgCustom = isCustom(s.background_color, DEFAULT_COLORS.background);
  const textCustom = isCustom(s.text_color, DEFAULT_COLORS.text);
  if (bgCustom || textCustom) {
    const bg = hexToHsl(
      bgCustom ? s.background_color : isDark ? DARK_DEFAULTS.background : DEFAULT_COLORS.background
    );
    const fg = hexToHsl(
      textCustom ? s.text_color : isDark ? DARK_DEFAULTS.text : DEFAULT_COLORS.text
    );
    const light = bg.l >= 50;
    style["--background"] = css(bg);
    style["--foreground"] = css(fg);
    style["--card"] = css({ ...bg, l: light ? Math.min(bg.l + 2, 100) : Math.min(bg.l + 3, 100) });
    const muted = css({ ...bg, l: light ? Math.max(bg.l - 4, 0) : Math.min(bg.l + 4, 100) });
    style["--secondary"] = muted;
    style["--muted"] = muted;
    style["--muted-foreground"] = css({ h: fg.h, s: Math.min(fg.s, 20), l: light ? 42 : 68 });
    const border = css({
      ...bg,
      s: Math.min(bg.s, 15),
      l: light ? Math.max(bg.l - 7, 0) : Math.min(bg.l + 8, 100),
    });
    style["--border"] = border;
    style["--input"] = border;
  }

  return style;
}