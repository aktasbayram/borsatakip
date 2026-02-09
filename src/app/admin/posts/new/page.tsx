import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import PostEditor from "@/components/admin/PostEditor";

export default async function NewPostPage() {
    const session = await auth();

    if (session?.user?.role !== "ADMIN") {
        redirect("/");
    }

    return (
        <div className="py-8">
            <PostEditor />
        </div>
    );
}
