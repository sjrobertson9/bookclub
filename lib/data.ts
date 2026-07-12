import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/database.types";

export type Board = Tables<"boards">;
export type Discussion = Tables<"discussions">;
export type Post = Tables<"posts">;
export type PostNode = Post & { children: PostNode[] };

export async function getBoards(): Promise<Board[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("boards").select("*").order("created_at");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getBoard(boardId: string): Promise<Board> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("boards").select('*').eq('id', boardId).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getBoardBySlug(slug: string): Promise<Board> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("boards").select('*').eq('slug', slug).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getDiscussions(boardId: string): Promise<Discussion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("discussions")
    .select("*")
    .eq("board_id", boardId)
    .order("created_at");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getDicussion(discussionId: string): Promise<Discussion> {
  const supabase = await createClient();
  const {data, error} = await supabase.from("discussions").select("*").eq('id', discussionId).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getDiscussionBySlug(boardId: string, slug: string): Promise<Discussion> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("discussions")
    .select("*")
    .eq("board_id", boardId)
    .eq("slug", slug)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getPosts(discussionId: string): Promise<PostNode[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("discussion_id", discussionId)
    .order("created_at");
  if (error) throw new Error(error.message);
  return buildPostTree(data ?? []);
}

function buildPostTree(posts: Post[]): PostNode[] {
  const nodeMap = new Map<string, PostNode>();
  for (const post of posts) {
    nodeMap.set(post.id, { ...post, children: [] });
  }

  const roots: PostNode[] = [];
  for (const post of posts) {
    const node = nodeMap.get(post.id)!;
    if (post.parent_id === null) {
      roots.push(node);
    } else {
      const parent = nodeMap.get(post.parent_id);
      if (parent) {
        parent.children.push(node);
      }
      // Silently drop orphans (can't happen with ON DELETE CASCADE)
    }
  }

  return roots;
}
