export const dynamic = "force-dynamic";

import { getBoardBySlug, getDiscussions } from "@/lib/data";
import Link from "next/link";

export default async function Page({ params }: { params: Promise<{ boardSlug: string }> }) {
  const { boardSlug } = await params;
  const board = await getBoardBySlug(boardSlug);
  const discussions = await getDiscussions(board.id);
  const sorted = [...discussions].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (a.scheduled_date && b.scheduled_date) return a.scheduled_date.localeCompare(b.scheduled_date);
    if (a.scheduled_date) return -1;
    if (b.scheduled_date) return 1;
    return 0;
  });

  return (
    <div className="max-w-5xl mx-auto p-5 flex flex-col gap-4">
      <Link href="/" className="text-sm hover:underline">← Back</Link>
      <h1 className="text-xl font-semibold">Reading Schedule:</h1>
      <div className="flex flex-col gap-2">
        {sorted.map((d) => (
          <Link
            key={d.id}
            href={`/board/${boardSlug}/discussion/${d.slug}`}
            className="flex items-center justify-between hover:underline"
          >
            <span>{d.pinned && "📌 "}{d.title}</span>
            {d.scheduled_date && (
              <span className="text-xs text-muted-foreground">
                {new Date(d.scheduled_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
