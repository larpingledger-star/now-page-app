import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { GripVertical, Pencil, Trash2, Plus } from "lucide-react";

export default function SectionList({
  sections,
  onReorder,
  onToggle,
  onEdit,
  onDelete,
  onAdd,
}) {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold tracking-tight">Sections</h2>
        <Button size="sm" onClick={onAdd}>
          <Plus className="mr-1.5 h-4 w-4" /> New section
        </Button>
      </div>

      {sections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="font-heading text-xl italic text-muted-foreground">
            What defines your present moment?
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Create your first section to begin.</p>
          <Button className="mt-5" size="sm" onClick={onAdd}>
            <Plus className="mr-1.5 h-4 w-4" /> New section
          </Button>
        </div>
      ) : (
        <DragDropContext onDragEnd={onReorder}>
          <Droppable droppableId="sections">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2.5">
                {sections.map((s, i) => (
                  <Draggable key={s.id} draggableId={s.id} index={i}>
                    {(p, snap) => (
                      <div
                        ref={p.innerRef}
                        {...p.draggableProps}
                        className={`flex items-center gap-3 rounded-xl border bg-card px-3 py-3 transition-shadow ${
                          snap.isDragging
                            ? "border-primary/40 shadow-lg"
                            : "border-border shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                        }`}
                      >
                        <div
                          {...p.dragHandleProps}
                          className="cursor-grab rounded p-1 text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing"
                        >
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <span className="w-6 font-mono text-[12px] tabular-nums text-muted-foreground/60">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate font-medium ${
                              s.enabled ? "text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {s.title || "Untitled"}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {(s.blocks || []).length} block
                            {(s.blocks || []).length === 1 ? "" : "s"}
                            {s.subtitle ? ` · ${s.subtitle}` : ""}
                          </p>
                        </div>
                        <Switch checked={!!s.enabled} onCheckedChange={() => onToggle(s)} />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => onEdit(s)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => onDelete(s)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}