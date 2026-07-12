export const dynamic = "force-dynamic";

import { getBoardBySlug, getDiscussions } from "@/lib/data";
import Link from "next/link";

export default async function Page({ params }: { params: Promise<{ boardSlug: string }> }) {
  const { boardSlug } = await params;
  const board = await getBoardBySlug(boardSlug);
  const discussions = await getDiscussions(board.id);

  return (
    <div className="max-w-5xl mx-auto p-5 flex flex-col gap-4">
      <Link href="/" className="text-sm hover:underline">← Back</Link>
      <h1 className="text-xl font-semibold">Discussions:</h1>
      <div className="flex flex-col gap-2">
        {discussions.map((d) => (
          <Link
            key={d.id}
            href={`/board/${boardSlug}/discussion/${d.slug}`}
            className="hover:underline"
          >
            {d.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
