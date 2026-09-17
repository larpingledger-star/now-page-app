import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Settings, LogOut, ExternalLink, Loader2 } from "lucide-react";
import SectionList from "@/components/dashboard/SectionList";
import SectionEditor from "@/components/dashboard/SectionEditor";
import SiteSettingsPanel from "@/components/dashboard/SiteSettingsPanel";
import { createBlock } from "@/lib/blocks";

export default function Dashboard() {
  const { logout } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState(null);
  const [sections, setSections] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [savingSection, setSavingSection] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, secs] = await Promise.all([
        db.entities.SiteSetting.list().catch(() => []),
        db.entities.Section.filter({}, "order", 100).catch(() => []),
      ]);
      setSettings(s[0] || null);
      setSections((secs || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selected = sections.find((s) => s.id === selectedId) || null;

  const addSection = async () => {
    try {
      const order = (sections.length ? Math.max(...sections.map((s) => s.order ?? 0)) : -1) + 1;
      const created = await db.entities.Section.create({
        title: "New section",
        subtitle: "",
        kind: "custom",
        order,
        enabled: true,
        blocks: [createBlock("text")],
      });
      setSections((prev) =>
        [...prev, created].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      );
      setSelectedId(created.id);
      toast({ title: "Section created" });
    } catch (e) {
      toast({ title: "Could not create section", description: e.message, variant: "destructive" });
    }
  };

  const saveSection = async (draft) => {
    setSavingSection(true);
    try {
      const updated = await db.entities.Section.update(draft.id, {
        title: draft.title,
        subtitle: draft.subtitle,
        kind: draft.kind,
        blocks: draft.blocks,
      });
      setSections((prev) =>
        prev
          .map((s) => (s.id === draft.id ? { ...s, ...updated } : s))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      );
      setSelectedId(null);
      toast({ title: "Section saved" });
    } catch (e) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSavingSection(false);
    }
  };

  const deleteSection = async (s) => {
    if (!window.confirm(`Delete "${s.title}"? This cannot be undone.`)) return;
    try {
      await db.entities.Section.delete(s.id);
      setSections((prev) => prev.filter((x) => x.id !== s.id));
      toast({ title: "Section deleted" });
    } catch (e) {
      toast({ title: "Delete failed", description: e.message, variant: "destructive" });
    }
  };

  const toggleSection = async (s) => {
    try {
      const updated = await db.entities.Section.update(s.id, { enabled: !s.enabled });
      setSections((prev) => prev.map((x) => (x.id === s.id ? { ...x, ...updated } : x)));
    } catch (e) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    }
  };

  const reorderSections = async (result) => {
    if (!result.destination) return;
    const next = [...sections];
    const [moved] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, moved);
    const ordered = next.map((s, i) => ({ ...s, order: i }));
    setSections(ordered);
    try {
      await db.entities.Section.bulkUpdate(ordered.map((s) => ({ id: s.id, order: s.order })));
    } catch (e) {
      toast({ title: "Reorder failed", description: e.message, variant: "destructive" });
      load();
    }
  };

  const saveSettings = async (draft) => {
    try {
      if (settings?.id) {
        const updated = await db.entities.SiteSetting.update(settings.id, draft);
        setSettings(updated);
      } else {
        const created = await db.entities.SiteSetting.create(draft);
        setSettings(created);
      }
      toast({ title: "Settings saved" });
    } catch (e) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-5 py-3 md:px-8">
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-[17px] font-semibold tracking-tight">Now</span>
            <span className="font-mono text-[11px] tracking-wide text-muted-foreground">
              / dashboard
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/" target="_blank">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />{" "}
                <span className="hidden sm:inline">View site</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(true)}>
              <Settings className="mr-1.5 h-3.5 w-3.5" />{" "}
              <span className="hidden sm:inline">Settings</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              <LogOut className="mr-1.5 h-3.5 w-3.5" />{" "}
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-5 py-8 md:px-8 md:py-12">
        {loading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : selected ? (
          <SectionEditor
            section={selected}
            onBack={() => setSelectedId(null)}
            onSave={saveSection}
            saving={savingSection}
          />
        ) : (
          <>
            <div className="mb-8">
              <h1 className="font-heading text-3xl font-medium tracking-tight md:text-4xl">
                Curate your Now
              </h1>
              <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-muted-foreground">
                Compose modular sections that appear on your public page. Reorder, enable, and edit
                blocks to reflect your present moment.
              </p>
            </div>
            <SectionList
              sections={sections}
              onReorder={reorderSections}
              onToggle={toggleSection}
              onEdit={(s) => setSelectedId(s.id)}
              onDelete={deleteSection}
              onAdd={addSection}
            />
          </>
        )}
      </main>

      <SiteSettingsPanel
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSave={saveSettings}
      />
    </div>
  );
}