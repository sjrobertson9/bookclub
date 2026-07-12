"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signInviteToken } from "@/lib/invite-token";
import { slugify } from "@/lib/slugify";

async function uniqueBoardSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  name: string,
): Promise<string> {
  const base = slugify(name);
  let slug = base;
  for (let n = 2; ; n++) {
    const { data } = await supabase.from("boards").select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    slug = `${base}-${n}`;
  }
}

async function uniqueDiscussionSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  boardId: string,
  title: string,
): Promise<string> {
  const base = slugify(title);
  let slug = base;
  for (let n = 2; ; n++) {
    const { data } = await supabase
      .from("discussions")
      .select("id")
      .eq("board_id", boardId)
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return slug;
    slug = `${base}-${n}`;
  }
}

export async function createBoard(formData: FormData) {
  const name = formData.get("name") as string;
  const supabase = await createClient();
  const slug = await uniqueBoardSlug(supabase, name);
  const { data: board, error } = await supabase
    .from("boards")
    .insert({ name, slug })
    .select()
    .single();
  if (error) throw new Error(error.message);
  redirect(`/admin/boards/${board.id}`);
}

export async function createDiscussion(boardId: string, formData: FormData) {
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const scheduled_date = (formData.get("scheduled_date") as string) || null;
  const supabase = await createClient();
  const slug = await uniqueDiscussionSlug(supabase, boardId, title);

  const { data: last } = await supabase
    .from("discussions")
    .select("position")
    .eq("board_id", boardId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const position = (last?.position ?? 0) + 1;

  const { error } = await supabase
    .from("discussions")
    .insert({ board_id: boardId, title, description, slug, scheduled_date, position })
    .select()
    .single();
  if (error) throw new Error(error.message);
  redirect(`/admin/boards/${boardId}`);
}

export async function updateDiscussion(discussionId: string, boardId: string, formData: FormData) {
  const description = (formData.get("description") as string) || null;
  const scheduled_date = (formData.get("scheduled_date") as string) || null;
  const supabase = await createClient();
  const { error } = await supabase
    .from("discussions")
    .update({ description, scheduled_date })
    .eq("id", discussionId);
  if (error) throw new Error(error.message);
  redirect(`/admin/boards/${boardId}`);
}

export async function reorderDiscussions(boardId: string, orderedIds: string[]) {
  const supabase = await createClient();
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("discussions").update({ position: index }).eq("id", id).eq("board_id", boardId),
    ),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message);
}

export async function deleteDiscussion(discussionId: string, boardId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("discussions").delete().eq("id", discussionId);
  if (error) throw new Error(error.message);
  redirect(`/admin/boards/${boardId}`);
}

export async function deleteBoard(boardId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("boards")
    .delete()
    .eq("id", boardId);
  if (error) {
    console.log(error)
    throw new Error(error.message);
  }
  redirect(`/admin`);
}

export async function generateInviteLink(boardId: string) {
  const token = await signInviteToken(boardId);
  redirect(`/admin/boards/${boardId}?invite=${token}`);
}
