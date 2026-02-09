import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageEditor } from "@/components/admin/PageEditor";

export default async function NewPagePage() {
    const session = await auth();

    if (session?.user?.role !== "ADMIN") {
        redirect("/");
    }

    return (
        <div className="py-8">
            <PageEditor />
        </div>
    );
}
