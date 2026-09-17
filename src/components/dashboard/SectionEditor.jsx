import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Trash2, GripVertical, Loader2, Eye, Pencil } from "lucide-react";
import { BlockEditor, BlockPicker } from "@/components/dashboard/BlockEditors";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import { createBlock } from "@/lib/blocks";

const KIND_SUGGESTIONS = [
  "Building",
  "Reading",
  "Learning",
  "Listening",
  "Watching",
  "Working on",
  "Interested in",
];

export default function SectionEditor({ section, onBack, onSave, saving }) {
  const [draft, setDraft] = useState(section);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    setDraft(section);
  }, [section]);

  const updateBlock = (i, block) => {
    const blocks = [...(draft.blocks || [])];
    blocks[i] = block;
    setDraft({ ...draft, blocks });
  };

  const removeBlock = (i) => {
    setDraft({
      ...draft,
      blocks: (draft.blocks || []).filter((_, idx) => idx !== i),
    });
  };

  const addBlock = (type) => {
    setDraft({ ...draft, blocks: [...(draft.blocks || []), createBlock(type)] });
    setPickerOpen(false);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const blocks = [...(draft.blocks || [])];
    const [moved] = blocks.splice(result.source.index, 1);
    blocks.splice(result.destination.index, 0, moved);
    setDraft({ ...draft, blocks });
  };

  const canSave = draft.title?.trim();

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> All sections
        </Button>
        <Button onClick={() => onSave(draft)} disabled={!canSave || saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save changes
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] md:p-7">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_200px]">
          <div className="space-y-2">
            <Label htmlFor="sec-title">Section title</Label>
            <Input
              id="sec-title"
              value={draft.title || ""}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Working on"
              className="text-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sec-kind">Kind</Label>
            <Input
              id="sec-kind"
              list="kind-suggestions"
              value={draft.kind || ""}
              onChange={(e) => setDraft({ ...draft, kind: e.target.value })}
              placeholder="e.g. Building, Listening…"
            />
            <datalist id="kind-suggestions">
              {KIND_SUGGESTIONS.map((k) => (
                <option key={k} value={k} />
              ))}
            </datalist>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <Label htmlFor="sec-sub">Subtitle (optional)</Label>
          <Input
            id="sec-sub"
            value={draft.subtitle || ""}
            onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
            placeholder="A short descriptor"
          />
        </div>
      </div>

      <Tabs defaultValue="compose" className="mt-6">
        <TabsList>
          <TabsTrigger value="compose">
            <Pencil className="mr-1.5 h-3.5 w-3.5" /> Compose
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="mr-1.5 h-3.5 w-3.5" /> Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="mt-4">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="blocks">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                  {(draft.blocks || []).map((block, i) => (
                    <Draggable key={i} draggableId={`block-${i}`} index={i}>
                      {(p, snapshot) => (
                        <div
                          ref={p.innerRef}
                          {...p.draggableProps}
                          className={`rounded-xl border bg-card p-4 transition-shadow ${
                            snapshot.isDragging
                              ? "border-primary/40 shadow-lg"
                              : "border-border shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div
                              {...p.dragHandleProps}
                              className="cursor-grab rounded p-1 text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
                            >
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                              {block.type}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => removeBlock(i)}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </div>
                          <div className="mt-3">
                            <BlockEditor block={block} onChange={(b) => updateBlock(i, b)} />
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {pickerOpen ? (
            <div className="mt-3 rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium">Add a block</span>
                <Button variant="ghost" size="sm" onClick={() => setPickerOpen(false)}>
                  Cancel
                </Button>
              </div>
              <BlockPicker onPick={addBlock} />
            </div>
          ) : (
            <Button
              variant="outline"
              className="mt-3 w-full border-dashed"
              onClick={() => setPickerOpen(true)}
            >
              <Plus className="mr-1.5 h-4 w-4" /> Add a block
            </Button>
          )}
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <div className="rounded-2xl border border-border bg-background p-6 md:p-10">
            <div className="mb-8 flex items-baseline gap-4">
              <span className="font-mono text-[12px] tabular-nums tracking-wide text-muted-foreground/70">
                —
              </span>
              <div>
                <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-[1.75rem]">
                  {draft.title || "Untitled"}
                </h2>
                {draft.subtitle && (
                  <p className="mt-1.5 text-sm text-muted-foreground">{draft.subtitle}</p>
                )}
              </div>
            </div>
            <div className="space-y-6 pl-0 md:pl-12">
              {(draft.blocks || []).map((block, i) => (
                <BlockRenderer key={i} block={block} />
              ))}
              {!(draft.blocks || []).length && (
                <p className="text-sm italic text-muted-foreground">No blocks yet.</p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}