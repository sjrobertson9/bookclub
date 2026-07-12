export const dynamic = "force-dynamic";

import Post from "@/components/post";
import { getBoardBySlug, getDiscussionBySlug, getPosts } from "@/lib/data";
import { createPost } from "@/app/board/actions";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const secret = () => new TextEncoder().encode(process.env.INVITE_SECRET!);

export default async function Page({
  params,
}: {
  params: Promise<{ boardSlug: string; discussionSlug: string }>;
}) {
  const { boardSlug, discussionSlug } = await params;
  const board = await getBoardBySlug(boardSlug);
  const discussion = await getDiscussionBySlug(board.id, discussionSlug);
  const posts = await getPosts(discussion.id);
  const rootAction = createPost.bind(null, discussion.id, null, boardSlug);

  const cookieStore = await cookies();
  const cookie = cookieStore.get("book_club_session");
  let handle: string | null = null;
  let currentUserId: string | null = null;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = !!user;

  if (cookie) {
    try {
      const { payload } = await jwtVerify(cookie.value, secret());
      const session = payload as { handle: string; user_id: string };
      handle = session.handle ?? null;
      currentUserId = session.user_id ?? null;
    } catch {
      // ignore
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-5 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link href={`/board/${boardSlug}`} className="text-sm hover:underline">← Back</Link>
        <div>{board.name}: {discussion.title}</div>
        {handle && <span className="text-sm text-muted-foreground">Commenting as <strong>{handle}</strong></span>}
      </div>
      {discussion.description && (
        <div className="rounded border p-4 text-sm bg-muted/40">
          <p className="font-medium mb-1">Starter prompt</p>
          <p className="text-muted-foreground whitespace-pre-wrap">{discussion.description}</p>
        </div>
      )}
      <div className="flex flex-col">
        {posts.map((post) => (
          <Post key={post.id} node={post} boardId={boardSlug} currentUserId={currentUserId} isAdmin={isAdmin} />
        ))}
      </div>
      <form action={rootAction} className="flex flex-col gap-2 border-t pt-4">
        <textarea
          name="content"
          required
          rows={4}
          className="border rounded px-3 py-2 text-sm w-full resize-none"
          placeholder="Add a comment... (supports **bold**, *italic*, > quote)"
        />
        <button type="submit" className="self-start text-sm underline underline-offset-4">
          Post
        </button>
      </form>
    </div>
  );
}
