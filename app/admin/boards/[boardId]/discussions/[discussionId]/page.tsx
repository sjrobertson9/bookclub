export const dynamic = "force-dynamic";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getDicussion } from "@/lib/data";
import { updateDiscussion } from "@/app/admin/actions";
import Link from "next/link";

export default async function EditDiscussionPage({
  params,
}: {
  params: Promise<{ boardId: string; discussionId: string }>;
}) {
  const { boardId, discussionId } = await params;
  const discussion = await getDicussion(discussionId);

  return (
    <div className="max-w-sm space-y-6">
      <Link href={`/admin/boards/${boardId}`} className="text-sm underline underline-offset-4">
        ← Back to board
      </Link>
      <h2 className="text-lg font-medium">Edit: {discussion.title}</h2>
      <form action={updateDiscussion.bind(null, discussionId, boardId)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description">Starter prompt</Label>
          <textarea
            id="description"
            name="description"
            rows={6}
            defaultValue={discussion.description ?? ""}
            className="border rounded px-3 py-2 text-sm w-full resize-none"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="scheduled_date">Reading date (optional)</Label>
          <Input id="scheduled_date" name="scheduled_date" type="date" defaultValue={discussion.scheduled_date ?? ""} />
        </div>
        <Button type="submit">Save</Button>
      </form>
    </div>
  );
}
