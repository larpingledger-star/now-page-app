import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { AnimatePresence } from "framer-motion";
import { Link as LinkIcon, ExternalLink } from "lucide-react";
import { normalizeEmbedUrl } from "@/lib/blocks";
import MusicPlayer from "@/components/blocks/MusicPlayer";
import Lightbox from "@/components/blocks/Lightbox";

const IMAGE_SIZE_CLASS = {
  small: "max-w-[480px]",
  normal: "max-w-[640px]",
  large: "max-w-[820px]",
  full: "w-full",
};

const mdComponents = {
  a: ({ node, ...props }) => <a target="_blank" rel="noreferrer" {...props} />,
};

function ImageBlock({ block, sizeClass }) {
  const [open, setOpen] = useState(false);

  if (!block.url) return null;

  return (
    <figure className={`group ${sizeClass}`}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full cursor-zoom-in rounded-lg text-left"
        aria-label="Open image fullscreen"
      >
        <div className="w-full overflow-hidden rounded-lg border border-border/70 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <img
            src={block.url}
            alt={block.caption || ""}
            className="w-full max-h-[600px] object-contain transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            loading="lazy"
          />
        </div>
      </button>
      {block.caption && (
        <figcaption className="mt-2.5 font-mono text-[12px] leading-relaxed tracking-wide text-muted-foreground">
          {block.caption}
        </figcaption>
      )}
      <AnimatePresence>
        {open && <Lightbox src={block.url} caption={block.caption} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </figure>
  );
}

function LinkBlock({ block, plain }) {
  if (!block.url) return null;

  if (plain) {
    return (
      <p className="max-w-[62ch] text-[1.0625rem] leading-[1.75]">
        <a
          href={block.url}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
        >
          {block.label || block.url}
        </a>
        {block.description && (
          <span className="text-muted-foreground"> — {block.description}</span>
        )}
      </p>
    );
  }

  return (
    <a
      href={block.url}
      target="_blank"
      rel="noreferrer"
      className="group flex max-w-[600px] items-start gap-3 rounded-lg border border-border/70 bg-card px-4 py-3.5 transition-all hover:border-primary/40 hover:shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
    >
      <LinkIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <span className="min-w-0">
        <span className="block font-medium text-foreground transition-colors group-hover:text-primary">
          {block.label || block.url}
        </span>
        {block.description && (
          <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">
            {block.description}
          </span>
        )}
      </span>
      <ExternalLink className="ml-auto mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
    </a>
  );
}

export default function BlockRenderer({ block, site }) {
  if (!block) return null;

  const sizeClass = IMAGE_SIZE_CLASS[site?.image_size || "normal"];

  switch (block.type) {
    case "text":
      return (
        <div className="prose-now max-w-[66ch]">
          <ReactMarkdown components={mdComponents}>{block.content || ""}</ReactMarkdown>
        </div>
      );

    case "heading":
      return (
        <h3 className="font-heading text-xl font-medium tracking-tight text-foreground md:text-2xl">
          {block.content}
        </h3>
      );

    case "image":
      return <ImageBlock block={block} sizeClass={sizeClass} />;

    case "link":
      return <LinkBlock block={block} plain={site?.link_style === "plain"} />;

    case "list":
      return (
        <ul className="max-w-[60ch] space-y-2.5">
          {(block.items || [])
            .filter((i) => i && i.trim())
            .map((item, i) => (
              <li key={i} className="flex gap-3 text-[1.0625rem] leading-relaxed text-foreground/85">
                <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                <span>{item}</span>
              </li>
            ))}
        </ul>
      );

    case "quote":
      if (!block.content) return null;
      return (
        <blockquote className="max-w-[58ch] border-l-2 border-primary/40 pl-6">
          <p className="font-heading text-xl italic leading-[1.5] text-foreground/90 md:text-[1.35rem]">
            {block.content}
          </p>
          {block.attribution && (
            <cite className="mt-3 block font-mono text-[12px] not-italic tracking-wide text-muted-foreground">
              — {block.attribution}
            </cite>
          )}
        </blockquote>
      );

    case "video":
      if (!block.url) return null;
      return (
        <figure className={sizeClass || "max-w-[640px]"}>
          <div className="w-full overflow-hidden rounded-lg border border-border/70 bg-card">
            <video
              src={block.url}
              controls
              className="w-full"
              preload="metadata"
            />
          </div>
          {block.caption && (
            <figcaption className="mt-2.5 font-mono text-[12px] tracking-wide text-muted-foreground">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "embed":
      if (!block.url) return null;
      return (
        <figure className="max-w-[640px]">
          <div className="aspect-video w-full overflow-hidden rounded-lg border border-border/70 bg-card">
            <iframe
              src={normalizeEmbedUrl(block.url)}
              title={block.caption || "Embedded media"}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
          {block.caption && (
            <figcaption className="mt-2.5 font-mono text-[12px] tracking-wide text-muted-foreground">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "music":
      return <MusicPlayer block={block} className={sizeClass} />;

    default:
      return null;
  }
}