export const dynamic = "force-dynamic";

import Link from "next/link";
import { headers } from "next/headers";
import { getBoard, getDiscussions } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { deleteBoard, generateInviteLink } from "@/app/admin/actions";
import { CopyInviteButton } from "./copy-invite-button";

export default async function BoardAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ boardId: string }>;
  searchParams: Promise<{ invite?: string }>;
}) {
  const { boardId } = await params;
  const { invite } = await searchParams;
  const discussions = await getDiscussions(boardId);
  const board = await getBoard(boardId);

  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  return (
    <div className="max-w-2xl space-y-8">
      <Link href="/admin" className="text-sm underline underline-offset-4">
          ← All books
        </Link>
      <div className="flex flex-col space-y-2">
        <h2 className="text-lg font-medium">Book: {board.name}</h2>
      </div>
      <section className="space-y-4">
        <h3 className="font-medium">Invite link</h3>
        <div className="flex items-center gap-3">
          {invite && (
            <CopyInviteButton url={`${origin}/join?token=${invite}`} />
          )}
          <form action={generateInviteLink.bind(null, boardId)}>
            <Button type="submit" variant="outline" size="sm">
              {invite ? "Regenerate" : "Generate invite link"}
            </Button>
          </form>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Discussions</h3>
          <Link
            href={`/admin/boards/${boardId}/discussions/new`}
            className="text-sm underline underline-offset-4"
          >
            New discussion
          </Link>
        </div>
        {discussions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No discussions yet.</p>
        ) : (
          <ul className="space-y-2">
            {discussions.map((d) => (
              <li key={d.id} className="flex items-center gap-3">
                <Link
                  href={`/board/${board.slug}/discussion/${d.slug}`}
                  className="text-sm underline underline-offset-4"
                >
                  {d.title}
                </Link>
                <Link
                  href={`/admin/boards/${boardId}/discussions/${d.id}`}
                  className="text-xs text-muted-foreground underline underline-offset-4"
                >
                  edit
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="space-y-4">
        <form action={deleteBoard.bind(null, boardId)}>
          <Button variant="destructive" type="submit">Delete</Button>
        </form>
      </section>
    </div>
  );
}
