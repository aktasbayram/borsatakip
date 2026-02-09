import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import PostEditor from "@/components/admin/PostEditor";

export default async function EditPostPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();

    if (session?.user?.role !== "ADMIN") {
        redirect("/");
    }

    const { id } = await params;
    const post = await db.post.findUnique({
        where: { id },
    });

    if (!post) {
        notFound();
    }

    return (
        <div className="py-8">
            <PostEditor initialData={JSON.parse(JSON.stringify(post))} />
        </div>
    );
}
