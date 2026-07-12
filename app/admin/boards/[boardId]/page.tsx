export const dynamic = "force-dynamic";

import Link from "next/link";
import { headers } from "next/headers";
import { getBoard, getDiscussions } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteBoard, generateInviteLink, updateBoard } from "@/app/admin/actions";
import { CopyInviteButton } from "./copy-invite-button";
import { ConfirmDeleteButton } from "./confirm-delete-button";
import { DiscussionsList } from "./discussions-list";

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
        <h3 className="font-medium">Book details</h3>
        <form action={updateBoard.bind(null, boardId)} className="space-y-4 max-w-sm">
          <div className="space-y-2">
            <Label htmlFor="cover_image_path">Cover image path</Label>
            <Input
              id="cover_image_path"
              name="cover_image_path"
              placeholder="/covers/devout.jpg"
              defaultValue={board.cover_image_path ?? ""}
            />
            <p className="text-xs text-muted-foreground">
              Drop the image file in <code>public/covers/</code>, then enter its path here.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              rows={5}
              defaultValue={board.description ?? ""}
              placeholder="What's this book about?"
              className="border rounded px-3 py-2 text-sm w-full resize-none"
            />
          </div>
          <Button type="submit">Save</Button>
        </form>
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
          <DiscussionsList initialDiscussions={discussions} boardId={boardId} boardSlug={board.slug} />
        )}
      </section>
      <section className="space-y-4">
        <ConfirmDeleteButton
          action={deleteBoard.bind(null, boardId)}
          confirmMessage={`Delete "${board.name}" and everything in it? This can't be undone.`}
        >
          <Button variant="destructive" type="submit">Delete</Button>
        </ConfirmDeleteButton>
      </section>
    </div>
  );
}
