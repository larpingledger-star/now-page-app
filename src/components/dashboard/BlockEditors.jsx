import React, { useRef, useState } from "react";
import db from '@/api/base44Client';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2, Upload, X, FileAudio } from "lucide-react";
import { BLOCK_TYPES } from "@/lib/blocks";

function MediaUpload({ value, onChange, accept = "image/*", label = "Upload image", kind = "image" }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handle = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await db.integrations.Core.UploadPublicFile({ file });
      onChange(file_url);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const trigger = () => inputRef.current?.click();

  if (kind === "audio") {
    return (
      <div className="space-y-2">
        <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handle} />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={trigger}
            disabled={uploading}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" /> {value ? "Replace audio file" : label}
              </>
            )}
          </button>
          {value && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0"
              onClick={() => onChange("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {value && (
          <p className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
            <FileAudio className="h-3.5 w-3.5" /> Audio file ready
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handle} />
      {value ? (
        <div className="group relative overflow-hidden rounded-lg border border-border">
          <img src={value} alt="" className="h-32 w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 rounded-md bg-background/90 p-1.5 text-muted-foreground shadow-sm transition-colors hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={trigger}
          disabled={uploading}
          className="flex h-28 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" /> {label}
            </>
          )}
        </button>
      )}
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="…or paste an image URL"
        className="font-mono text-xs"
      />
    </div>
  );
}

function TextBlockEditor({ block, onChange }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">Text · supports Markdown</Label>
      <Textarea
        rows={4}
        value={block.content}
        onChange={(e) => onChange({ ...block, content: e.target.value })}
        placeholder="Write a paragraph. Use **bold**, *italics*, and [links](https://…)."
      />
    </div>
  );
}

function HeadingBlockEditor({ block, onChange }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">Heading</Label>
      <Input
        value={block.content}
        onChange={(e) => onChange({ ...block, content: e.target.value })}
        placeholder="A sub-heading"
      />
    </div>
  );
}

function ImageBlockEditor({ block, onChange }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">Image</Label>
      <MediaUpload value={block.url} onChange={(url) => onChange({ ...block, url })} />
      <Input
        value={block.caption || ""}
        onChange={(e) => onChange({ ...block, caption: e.target.value })}
        placeholder="Caption (optional)"
        className="text-sm"
      />
    </div>
  );
}

function LinkBlockEditor({ block, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <Input
        value={block.label}
        onChange={(e) => onChange({ ...block, label: e.target.value })}
        placeholder="Link title"
      />
      <Input
        value={block.url}
        onChange={(e) => onChange({ ...block, url: e.target.value })}
        placeholder="https://…"
        className="font-mono text-xs sm:col-span-2"
      />
      <Input
        value={block.description || ""}
        onChange={(e) => onChange({ ...block, description: e.target.value })}
        placeholder="Short description (optional)"
        className="sm:col-span-2"
      />
    </div>
  );
}

function ListBlockEditor({ block, onChange }) {
  const items = block.items || [];
  const setItem = (i, v) => {
    const next = [...items];
    next[i] = v;
    onChange({ ...block, items: next });
  };
  const addItem = () => onChange({ ...block, items: [...items, ""] });
  const removeItem = (i) => onChange({ ...block, items: items.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">List items</Label>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <Input
            value={item}
            onChange={(e) => setItem(i, e.target.value)}
            placeholder={`Item ${i + 1}`}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeItem(i)}
            disabled={items.length <= 1}
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addItem}>
        <Plus className="mr-1.5 h-3.5 w-3.5" /> Add item
      </Button>
    </div>
  );
}

function QuoteBlockEditor({ block, onChange }) {
  return (
    <div className="space-y-2">
      <Textarea
        rows={3}
        value={block.content}
        onChange={(e) => onChange({ ...block, content: e.target.value })}
        placeholder="The quote"
      />
      <Input
        value={block.attribution || ""}
        onChange={(e) => onChange({ ...block, attribution: e.target.value })}
        placeholder="Attribution (optional)"
      />
    </div>
  );
}

function EmbedBlockEditor({ block, onChange }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">Embed (YouTube / Vimeo URL)</Label>
      <Input
        value={block.url}
        onChange={(e) => onChange({ ...block, url: e.target.value })}
        placeholder="https://youtube.com/watch?v=…"
        className="font-mono text-xs"
      />
      <Input
        value={block.caption || ""}
        onChange={(e) => onChange({ ...block, caption: e.target.value })}
        placeholder="Caption (optional)"
      />
    </div>
  );
}

function MusicBlockEditor({ block, onChange }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Input
          value={block.title}
          onChange={(e) => onChange({ ...block, title: e.target.value })}
          placeholder="Song title"
        />
        <Input
          value={block.artist}
          onChange={(e) => onChange({ ...block, artist: e.target.value })}
          placeholder="Artist"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Audio file (MP3)</Label>
        <MediaUpload
          kind="audio"
          accept="audio/*"
          label="Upload MP3"
          value={block.audio_url}
          onChange={(url) => onChange({ ...block, audio_url: url })}
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Cover artwork</Label>
        <MediaUpload
          label="Upload cover"
          value={block.cover_url}
          onChange={(url) => onChange({ ...block, cover_url: url })}
        />
      </div>
    </div>
  );
}

const EDITORS = {
  text: TextBlockEditor,
  heading: HeadingBlockEditor,
  image: ImageBlockEditor,
  link: LinkBlockEditor,
  list: ListBlockEditor,
  quote: QuoteBlockEditor,
  embed: EmbedBlockEditor,
  music: MusicBlockEditor,
};

export function BlockEditor({ block, onChange }) {
  const Cmp = EDITORS[block.type] || TextBlockEditor;
  return <Cmp block={block} onChange={onChange} />;
}

export function BlockPicker({ onPick }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {BLOCK_TYPES.map((bt) => (
        <button
          key={bt.type}
          type="button"
          onClick={() => onPick(bt.type)}
          className="group rounded-lg border border-border bg-card p-3 text-left transition-all hover:border-primary/40 hover:shadow-sm"
        >
          <span className="block text-sm font-medium text-foreground">{bt.label}</span>
          <span className="mt-1 block text-xs leading-snug text-muted-foreground">
            {bt.description}
          </span>
        </button>
      ))}
    </div>
  );
}