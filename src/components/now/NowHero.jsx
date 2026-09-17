import React from "react";

const DENSITY = {
  compact: "pb-10 pt-10 md:pb-16 md:pt-16",
  normal: "pb-16 pt-16 md:pb-24 md:pt-28",
  relaxed: "pb-20 pt-20 md:pb-32 md:pt-32",
};

export default function NowHero({ title, intro, updatedLabel, spacing }) {
  const d = DENSITY[spacing || "normal"];
  return (
    <section className={d}>
      <div className="animate-fade-up">
        <div className="mb-7 flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
            Now{updatedLabel ? ` · ${updatedLabel}` : ""}
          </span>
        </div>
        <h1 className="max-w-[20ch] font-heading text-[2.5rem] font-medium leading-[1.04] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[4.25rem]">
          {title || "A quiet record of what I'm focused on right now."}
        </h1>
        {intro && (
          <p className="mt-8 max-w-[58ch] text-lg leading-[1.7] text-foreground/65 md:text-xl">
            {intro}
          </p>
        )}
      </div>
    </section>
  );
}