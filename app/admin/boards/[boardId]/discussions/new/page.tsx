import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createDiscussion } from "@/app/admin/actions";

export default async function NewDiscussionPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;

  return (
    <div className="max-w-sm space-y-6">
      <h2 className="text-lg font-medium">New discussion</h2>
      <form action={createDiscussion.bind(null, boardId)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Starter prompt (optional)</Label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="What should members focus on?"
            className="border rounded px-3 py-2 text-sm w-full resize-none"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="scheduled_date">Reading date (optional)</Label>
          <Input id="scheduled_date" name="scheduled_date" type="date" />
        </div>
        <Button type="submit">Create discussion</Button>
      </form>
    </div>
  );
}
