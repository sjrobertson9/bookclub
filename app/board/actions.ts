"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import { createClient } from "@/lib/supabase/server";

const COOKIE_NAME = "book_club_session";
const secret = () => new TextEncoder().encode(process.env.INVITE_SECRET!);

async function discussionPath(
  supabase: Awaited<ReturnType<typeof createClient>>,
  boardSlug: string,
  discussionId: string,
): Promise<string> {
  const { data, error } = await supabase
    .from("discussions")
    .select("slug")
    .eq("id", discussionId)
    .single();
  if (error) throw new Error(error.message);
  return `/board/${boardSlug}/discussion/${data.slug}`;
}

export async function createPost(
  discussionId: string,
  parentId: string | null,
  boardId: string,
  formData: FormData,
) {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);

  let handle: string;
  let user_id: string;

  if (cookie) {
    try {
      const { payload } = await jwtVerify(cookie.value, secret());
      ({ handle, user_id } = payload as { handle: string; user_id: string });
    } catch {
      redirect("/auth/error");
    }
  } else {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/error");
    handle = user.email!;
    user_id = user.id;
  }

  const supabase = await createClient();
  const path = await discussionPath(supabase, boardId, discussionId);

  const content = (formData.get("content") as string)?.trim();
  if (!content) redirect(path);

  const { error } = await supabase.from("posts").insert({
    discussion_id: discussionId,
    parent_id: parentId,
    content,
    user_handle: handle,
    user_id,
  });
  if (error) throw new Error(error.message);

  redirect(path);
}

export async function editPost(
  postId: string,
  boardId: string,
  discussionId: string,
  formData: FormData,
) {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = !!user;

  let user_id: string | null = null;
  if (cookie) {
    try {
      const { payload } = await jwtVerify(cookie.value, secret());
      ({ user_id } = payload as { user_id: string });
    } catch {
      redirect("/auth/error");
    }
  }

  if (!isAdmin && user_id === null) redirect("/auth/error");

  const { data: post, error: fetchError } = await supabase
    .from("posts")
    .select("user_id")
    .eq("id", postId)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  if (!isAdmin && post.user_id !== user_id) {
    redirect("/auth/error");
  }

  const path = await discussionPath(supabase, boardId, discussionId);

  const content = (formData.get("content") as string)?.trim();
  if (!content) redirect(path);

  const { error } = await supabase
    .from("posts")
    .update({ content, updated_at: new Date().toISOString() })
    .eq("id", postId);
  if (error) throw new Error(error.message);

  redirect(path);
}

export async function deletePost(postId: string, boardId: string, discussionId: string) {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = !!user;

  let user_id: string | null = null;
  if (cookie) {
    try {
      const { payload } = await jwtVerify(cookie.value, secret());
      ({ user_id } = payload as { user_id: string });
    } catch {
      redirect("/auth/error");
    }
  }

  if (!isAdmin && user_id === null) redirect("/auth/error");

  const { data: post, error: fetchError } = await supabase
    .from("posts")
    .select("user_id")
    .eq("id", postId)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  if (!isAdmin && post.user_id !== user_id) {
    redirect("/auth/error");
  }

  const path = await discussionPath(supabase, boardId, discussionId);

  const { count } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("parent_id", postId);

  if (!count) {
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("posts")
      .update({ content: "[deleted]", deleted_at: new Date().toISOString() })
      .eq("id", postId);
    if (error) throw new Error(error.message);
  }

  redirect(path);
}

export async function purgePost(postId: string, boardId: string, discussionId: string) {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = !!user;

  let user_id: string | null = null;
  if (cookie) {
    try {
      const { payload } = await jwtVerify(cookie.value, secret());
      ({ user_id } = payload as { user_id: string });
    } catch {
      redirect("/auth/error");
    }
  }

  if (!isAdmin && user_id === null) redirect("/auth/error");

  const { data: post, error: fetchError } = await supabase
    .from("posts")
    .select("user_id")
    .eq("id", postId)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  if (!isAdmin && post.user_id !== user_id) {
    redirect("/auth/error");
  }

  const path = await discussionPath(supabase, boardId, discussionId);

  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) throw new Error(error.message);

  redirect(path);
}
