import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageEditor } from "@/components/admin/PageEditor";

export default async function EditPagePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();

    if (session?.user?.role !== "ADMIN") {
        redirect("/");
    }

    const { id } = await params;
    const page = await prisma.page.findUnique({
        where: { id },
    });

    if (!page) {
        notFound();
    }

    return (
        <div className="py-8">
            <PageEditor initialData={JSON.parse(JSON.stringify(page))} pageId={page.id} />
        </div>
    );
}
