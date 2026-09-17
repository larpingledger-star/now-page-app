import React from "react";

export default function FolioHeader({
  ownerName,
  location,
  lastUpdated,
  widthClass = "max-w-[1200px]",
  showName = true,
  showLocation = true,
  showTime = true,
}) {
  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className={`mx-auto flex items-center justify-between px-5 py-3 md:px-10 ${widthClass}`}>
        <div className="flex min-w-0 items-baseline gap-3">
          {showName && ownerName && (
            <span className="truncate font-heading text-[15px] font-semibold tracking-tight text-foreground">
              {ownerName}
            </span>
          )}
          {showLocation && location && (
            <span className="hidden truncate font-mono text-[11px] tracking-wide text-muted-foreground sm:inline">
              · {location}
            </span>
          )}
        </div>
        {showTime && (
          <div className="flex items-center gap-4">
            <span className="hidden font-mono text-[11px] tracking-wide text-muted-foreground md:inline">
              {today}
            </span>
            {lastUpdated && (
              <span className="hidden font-mono text-[11px] tracking-wide text-muted-foreground sm:inline">
                Updated {lastUpdated}
              </span>
            )}
          </div>
        )}
      </div>
    </header>
  );
}