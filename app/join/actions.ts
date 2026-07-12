"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyInviteToken } from "@/lib/invite-token";
import { getBoard } from "@/lib/data";

const COOKIE_NAME = "book_club_session";
const MAX_AGE = 60 * 60 * 24 * 90;

export async function joinBoard(token: string, handle: string) {
  let board_id: string;

  try {
    ({ board_id } = await verifyInviteToken(token));
  } catch {
    redirect("/auth/error");
  }

  const user_id = crypto.randomUUID();
  const granted_at = Date.now();

  const { SignJWT } = await import("jose");
  const secret = new TextEncoder().encode(process.env.INVITE_SECRET!);

  const sessionToken = await new SignJWT({ board_id, handle, user_id, granted_at })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("90d")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });

  const board = await getBoard(board_id);
  redirect(`/board/${board.slug}`);
}
