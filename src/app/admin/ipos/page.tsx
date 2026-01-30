import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SyncIposButton } from "./sync-ipos-button";
import { IpoTableClient } from "./ipo-table-client";

export default async function AdminIposPage() {
    let ipos: any[] = [];
    try {
        // @ts-ignore
        if (db.ipo) {
            // @ts-ignore
            ipos = await db.ipo.findMany({
                orderBy: [
                    { createdAt: 'desc' },
                    { id: 'desc' }
                ]
            });
        }
    } catch (error) {
        console.error("Failed to fetch IPOs:", error);
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Halka Arz Yönetimi</h1>
                    <p className="text-muted-foreground">
                        Manuel halka arz ekleyin veya senkronize edin.
                    </p>
                </div>
                <div className="flex gap-2">
                    <SyncIposButton />
                    <Link href="/admin/ipos/new">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Yeni Halka Arz
                        </Button>
                    </Link>
                </div>
            </div>

            <IpoTableClient initialIpos={ipos} />
        </div>
    );
}
