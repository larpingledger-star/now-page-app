import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { HEADING_FONTS, BODY_FONTS, DEFAULT_COLORS } from "@/lib/theme";

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[13px]">{label}</Label>
      {children}
    </div>
  );
}

function ColorField({ label, value, defaultValue, onChange }) {
  const isDefault = !value || value.toLowerCase() === defaultValue.toLowerCase();
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-[13px]">{label}</Label>
        {!isDefault && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[11px] text-muted-foreground"
            onClick={() => onChange(defaultValue)}
          >
            <RotateCcw className="mr-1 h-3 w-3" /> Reset
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2.5 rounded-lg border border-border bg-background px-2.5 py-2">
        <input
          type="color"
          value={value || defaultValue}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-9 cursor-pointer rounded border border-border bg-transparent p-0.5"
        />
        <span className="font-mono text-xs uppercase text-muted-foreground">
          {value || defaultValue}
        </span>
      </div>
    </div>
  );
}

function Group({ title, children }) {
  return (
    <div>
      <p className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}

function Preview({ draft }) {
  const heading = HEADING_FONTS.find((f) => f.value === draft.heading_font)?.css;
  const body = BODY_FONTS.find((f) => f.value === draft.body_font)?.css;
  const accent = draft.accent_color || DEFAULT_COLORS.accent;
  return (
    <div className="rounded-lg border border-border bg-background p-4" style={{ fontFamily: body }}>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: accent }}>
        Now
      </p>
      <p className="mt-1.5 text-lg font-medium leading-snug" style={{ fontFamily: heading }}>
        A quiet record of right now
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        What I'm focused on, updated as life shifts.
      </p>
    </div>
  );
}

export default function AppearanceSettings({ draft, onChange }) {
  const select = (key) => ({
    value: draft[key],
    onValueChange: (v) => onChange(key, v),
  });

  return (
    <div className="space-y-6">
      <Preview draft={draft} />

      <Group title="Theme">
        <Field label="Color mode">
          <Select {...select("theme_mode")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System default</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </Group>

      <Group title="Typography">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Heading font">
            <Select {...select("heading_font")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HEADING_FONTS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Body font">
            <Select {...select("body_font")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BODY_FONTS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Font size">
            <Select {...select("font_size")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Content width">
            <Select {...select("content_width")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="narrow">Narrow</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="wide">Wide</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </Group>

      <Group title="Layout">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Spacing">
            <Select {...select("spacing")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="relaxed">Relaxed</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Corner radius">
            <Select {...select("corner_radius")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sharp">Sharp</SelectItem>
                <SelectItem value="soft">Soft</SelectItem>
                <SelectItem value="rounded">Rounded</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Image size">
            <Select {...select("image_size")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="full">Full width</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Link blocks">
            <Select {...select("link_style")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Bordered cards</SelectItem>
                <SelectItem value="plain">Plain text</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </Group>

      <Group title="Colors">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ColorField
            label="Accent"
            value={draft.accent_color}
            defaultValue={DEFAULT_COLORS.accent}
            onChange={(v) => onChange("accent_color", v)}
          />
          <ColorField
            label="Background"
            value={draft.background_color}
            defaultValue={DEFAULT_COLORS.background}
            onChange={(v) => onChange("background_color", v)}
          />
          <ColorField
            label="Text"
            value={draft.text_color}
            defaultValue={DEFAULT_COLORS.text}
            onChange={(v) => onChange("text_color", v)}
          />
        </div>
      </Group>
    </div>
  );
}