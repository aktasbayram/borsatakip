import { IpoForm } from "@/components/admin/IpoForm";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditIpoPage(props: PageProps) {
    const params = await props.params;

    let ipo = null;
    try {
        // @ts-ignore
        if (db.ipo) {
            // @ts-ignore
            ipo = await db.ipo.findUnique({
                where: { id: params.id }
            });
        }
    } catch (error) {
        console.error("Failed to fetch IPO:", error);
    }

    if (!ipo) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Halka Arz Düzenle</h1>
                <p className="text-muted-foreground">
                    {ipo.company} ({ipo.code}) bilgilerini düzenleyin.
                </p>
            </div>
            <IpoForm initialData={ipo} />
        </div>
    );
}
