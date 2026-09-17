import React, { useEffect, useState } from "react";

import { formatDistanceToNow } from "date-fns";
import FolioHeader from "@/components/now/FolioHeader";
import NowHero from "@/components/now/NowHero";
import SectionView from "@/components/now/SectionView";
import { buildThemeStyle } from "@/lib/theme";

const WIDTH_CLASS = {
  narrow: "max-w-[880px]",
  normal: "max-w-[1200px]",
  wide: "max-w-[1400px]",
};
const FONT_SIZE_PX = { compact: "15px", normal: "16px", large: "17.5px" };

export default function Home() {
  const [settings, setSettings] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    (async () => {
      try {
        const [settingList, sectionList] = await Promise.all([
          db.entities.SiteSetting.list().catch(() => []),
          db.entities.Section.filter({ enabled: true }, "order", 100).catch(() => []),
        ]);
        setSettings(settingList[0] || null);
        setSections(sectionList || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const themeMode = settings?.theme_mode || "light";

  useEffect(() => {
    if (themeMode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const fn = (e) => setSystemDark(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, [themeMode]);

  const isDark = themeMode === "dark" || (themeMode === "system" && systemDark);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    return () => document.documentElement.classList.remove("dark");
  }, [isDark]);

  useEffect(() => {
    const prev = document.documentElement.style.fontSize;
    document.documentElement.style.fontSize = FONT_SIZE_PX[settings?.font_size] || "16px";
    return () => {
      document.documentElement.style.fontSize = prev;
    };
  }, [settings?.font_size]);

  const lastUpdated = (() => {
    if (!sections.length) return "";
    const latest = sections.reduce((a, b) =>
      new Date(b.updated_date) > new Date(a.updated_date) ? b : a
    );
    try {
      return formatDistanceToNow(new Date(latest.updated_date), { addSuffix: true });
    } catch {
      return "";
    }
  })();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  const widthClass = WIDTH_CLASS[settings?.content_width] || WIDTH_CLASS.normal;
  const showTime = settings?.show_time !== false;

  return (
    <div className="min-h-screen bg-background" style={buildThemeStyle(settings, isDark)}>
      <FolioHeader
        ownerName={settings?.owner_name}
        location={settings?.location}
        lastUpdated={lastUpdated}
        widthClass={widthClass}
        showName={settings?.show_name !== false}
        showLocation={settings?.show_location !== false}
        showTime={showTime}
      />
      <main className={`mx-auto px-5 md:px-10 ${widthClass}`}>
        <NowHero
          title={settings?.hero_title}
          intro={settings?.hero_intro}
          updatedLabel={showTime && lastUpdated ? `updated ${lastUpdated}` : ""}
          spacing={settings?.spacing}
        />
        <div className="pb-24">
          {sections.length === 0 ? (
            <div className="border-t border-border/60 pb-32 pt-16 text-center">
              <p className="font-heading text-2xl italic text-muted-foreground">
                Nothing here yet.
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                The curator is still composing this page.
              </p>
            </div>
          ) : (
            sections.map((s, i) => <SectionView key={s.id} section={s} index={i} site={settings} />)
          )}
        </div>
      </main>
      <footer className="border-t border-border/60">
        <div className={`mx-auto px-5 py-10 md:px-10 ${widthClass}`}>
          <p className="font-mono text-[11px] leading-relaxed tracking-wide text-muted-foreground">
            A <span className="text-foreground/80">/now</span> page, inspired by{" "}
            <a
              href="https://nownownow.com"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
            >
              Derek Sivers
            </a>
            .
          </p>
          <p className="mt-2 font-mono text-[11px] tracking-wide text-muted-foreground/60">
            © {new Date().getFullYear()} {settings?.owner_name || ""}
          </p>
        </div>
      </footer>
    </div>
  );
}