import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import AppearanceSettings from "@/components/dashboard/AppearanceSettings";
import { DEFAULT_COLORS } from "@/lib/theme";

const DEFAULTS = {
  show_name: true,
  show_location: true,
  show_time: true,
  show_kind: true,
  theme_mode: "light",
  heading_font: "source-serif",
  body_font: "inter",
  font_size: "normal",
  content_width: "normal",
  corner_radius: "soft",
  spacing: "normal",
  image_size: "normal",
  link_style: "card",
  accent_color: DEFAULT_COLORS.accent,
  background_color: DEFAULT_COLORS.background,
  text_color: DEFAULT_COLORS.text,
};

function ToggleRow({ label, hint, checked, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export default function SiteSettingsPanel({ open, onOpenChange, settings, onSave }) {
  const [draft, setDraft] = useState({ ...DEFAULTS, ...(settings || {}) });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft({ ...DEFAULTS, ...(settings || {}) });
  }, [settings, open]);

  const field = (key) => ({
    value: draft[key] || "",
    onChange: (e) => setDraft((d) => ({ ...d, [key]: e.target.value })),
  });

  const toggle = (key) => (v) => setDraft((d) => ({ ...d, [key]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(draft);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle>Site settings</DialogTitle>
          <DialogDescription>
            Identity, visibility, and the look of your public page.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="identity" className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="identity">Identity</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="identity" className="mt-5 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ss-name">Your name</Label>
                <Input id="ss-name" {...field("owner_name")} placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ss-loc">Location</Label>
                <Input id="ss-loc" {...field("location")} placeholder="City, Country" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ss-hero">Hero title</Label>
              <Input
                id="ss-hero"
                {...field("hero_title")}
                placeholder="Currently building, reading, and exploring."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ss-intro">Hero intro</Label>
              <Textarea
                id="ss-intro"
                rows={3}
                {...field("hero_intro")}
                placeholder="A sentence or two about what this page captures."
              />
            </div>
          </TabsContent>

          <TabsContent value="display" className="mt-5 space-y-2.5">
            <ToggleRow
              label="Show name"
              hint="Your name in the top bar"
              checked={draft.show_name}
              onChange={toggle("show_name")}
            />
            <ToggleRow
              label="Show location"
              hint="Shown beside your name"
              checked={draft.show_location}
              onChange={toggle("show_location")}
            />
            <ToggleRow
              label="Show time"
              hint="Today's date and the last-updated time"
              checked={draft.show_time}
              onChange={toggle("show_time")}
            />
            <ToggleRow
              label="Show kind"
              hint="Section labels like Building or Reading"
              checked={draft.show_kind}
              onChange={toggle("show_kind")}
            />
          </TabsContent>

          <TabsContent value="appearance" className="mt-5">
            <AppearanceSettings
              draft={draft}
              onChange={(key, value) => setDraft((d) => ({ ...d, [key]: value }))}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}