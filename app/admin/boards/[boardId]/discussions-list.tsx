"use client";

import { useState } from "react";
import Link from "next/link";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { move } from "@dnd-kit/helpers";
import { GripVertical } from "lucide-react";
import type { Discussion } from "@/lib/data";
import { deleteDiscussion, reorderDiscussions } from "@/app/admin/actions";
import { ConfirmDeleteButton } from "./confirm-delete-button";

function SortableDiscussionRow({
  discussion,
  index,
  boardId,
  boardSlug,
}: {
  discussion: Discussion;
  index: number;
  boardId: string;
  boardSlug: string;
}) {
  const { ref, handleRef, isDragging } = useSortable({ id: discussion.id, index });

  return (
    <li ref={ref} className={`flex items-center gap-3 ${isDragging ? "opacity-50" : ""}`}>
      <span ref={handleRef} className="cursor-grab active:cursor-grabbing text-muted-foreground touch-none">
        <GripVertical size={16} />
      </span>
      <Link href={`/board/${boardSlug}/discussion/${discussion.slug}`} className="text-sm underline underline-offset-4">
        {discussion.title}
      </Link>
      <Link href={`/admin/boards/${boardId}/discussions/${discussion.id}`} className="text-xs text-muted-foreground underline underline-offset-4">
        edit
      </Link>
      <ConfirmDeleteButton
        action={deleteDiscussion.bind(null, discussion.id, boardId)}
        confirmMessage={`Delete "${discussion.title}" and all its comments? This can't be undone.`}
      >
        <button type="submit" className="text-xs text-muted-foreground underline underline-offset-4">
          delete
        </button>
      </ConfirmDeleteButton>
    </li>
  );
}

export function DiscussionsList({
  initialDiscussions,
  boardId,
  boardSlug,
}: {
  initialDiscussions: Discussion[];
  boardId: string;
  boardSlug: string;
}) {
  const [items, setItems] = useState(initialDiscussions);

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;
        const reordered = move(items, event);
        setItems(reordered);
        void reorderDiscussions(boardId, reordered.map((d) => d.id)); // persist; UI already updated optimistically
      }}
    >
      <ul className="space-y-2">
        {items.map((d, index) => (
          <SortableDiscussionRow key={d.id} discussion={d} index={index} boardId={boardId} boardSlug={boardSlug} />
        ))}
      </ul>
    </DragDropProvider>
  );
}
