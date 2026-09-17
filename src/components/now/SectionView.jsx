import React from "react";
import BlockRenderer from "@/components/blocks/BlockRenderer";

const DENSITY = {
  compact: { section: "pb-2 pt-8 md:pt-10", gap: "space-y-4" },
  normal: { section: "pb-4 pt-12 md:pt-16", gap: "space-y-6" },
  relaxed: { section: "pb-8 pt-16 md:pt-24", gap: "space-y-8" },
};

export default function SectionView({ section, index, site }) {
  const d = DENSITY[site?.spacing || "normal"];
  const showKind = site?.show_kind !== false;

  return (
    <section className={`animate-fade-up border-t border-border/60 ${d.section}`}>
      <div className="mb-8 flex items-baseline gap-4">
        <span className="font-mono text-[12px] tabular-nums tracking-wide text-muted-foreground/70">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div>
          {showKind && section.kind && (
            <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
              {section.kind.replace(/_/g, " ")}
            </p>
          )}
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-[1.75rem]">
            {section.title}
          </h2>
          {section.subtitle && (
            <p className="mt-1.5 text-sm text-muted-foreground md:text-[15px]">{section.subtitle}</p>
          )}
        </div>
      </div>
      <div className={`pl-0 md:pl-12 ${d.gap}`}>
        {(section.blocks || []).map((block, i) => (
          <BlockRenderer key={i} block={block} site={site} />
        ))}
      </div>
    </section>
  );
}