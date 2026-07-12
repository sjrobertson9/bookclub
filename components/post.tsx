"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import type { PostNode } from "@/lib/data";
import { createPost, editPost } from "@/app/board/actions";

export default function Post({
  node,
  boardId,
  currentUserId,
  isAdmin = false,
  depth = 0,
}: {
  node: PostNode;
  boardId: string;
  currentUserId: string | null;
  isAdmin?: boolean;
  depth?: number;
}) {
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const replyAction = createPost.bind(null, node.discussion_id, node.id, boardId);
  const editAction = editPost.bind(null, node.id, boardId, node.discussion_id);
  const canEdit = isAdmin || (currentUserId !== null && node.user_id === currentUserId);

  return (
    <div style={{ marginLeft: depth * 24 }} className="py-2">
      <div className="text-sm font-semibold">{node.user_handle}</div>
      {editing ? (
        <form action={editAction} className="mt-1 flex flex-col gap-2">
          <textarea
            name="content"
            required
            autoFocus
            rows={3}
            defaultValue={node.content}
            className="border rounded px-3 py-2 text-sm w-full max-w-lg resize-none"
            placeholder="Edit your comment... (supports **bold**, *italic*, > quote)"
          />
          <div className="flex items-center gap-3">
            <button type="submit" className="self-start text-sm underline underline-offset-4">
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="self-start text-sm text-muted-foreground underline underline-offset-4"
            >
              cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="text-sm">
          <ReactMarkdown remarkPlugins={[remarkBreaks]}>{node.content}</ReactMarkdown>
        </div>
      )}
      <div className="flex items-center gap-3 mt-1">
        <span className="text-xs text-muted-foreground">
          {new Date(node.created_at).toLocaleString()}
          {node.updated_at && " (edited)"}
        </span>
        <button
          onClick={() => setReplying((v) => !v)}
          className="text-xs text-muted-foreground hover:underline"
        >
          {replying ? "cancel" : "reply"}
        </button>
        {canEdit && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-muted-foreground hover:underline"
          >
            edit
          </button>
        )}
      </div>
      {replying && (
        <form action={replyAction} className="mt-2 flex flex-col gap-2">
          <textarea
            name="content"
            required
            autoFocus
            rows={3}
            className="border rounded px-3 py-2 text-sm w-full max-w-lg resize-none"
            placeholder="Write a reply... (supports **bold**, *italic*, > quote)"
          />
          <button type="submit" className="self-start text-sm underline underline-offset-4">
            Post reply
          </button>
        </form>
      )}
      {node.children.map((child) => (
        <Post key={child.id} node={child} boardId={boardId} currentUserId={currentUserId} isAdmin={isAdmin} depth={depth + 1} />
      ))}
    </div>
  );
}
