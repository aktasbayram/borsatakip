import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EditorChoiceTableClient } from "./editor-choice-table-client";

export default async function AdminEditorChoicesPage() {
    let choices: any[] = [];
    try {
        // @ts-ignore
        if (db.editorChoice) {
            // @ts-ignore
            choices = await db.editorChoice.findMany({
                orderBy: { createdAt: 'desc' }
            });
        }
    } catch (error) {
        console.error("Failed to fetch editor choices:", error);
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Editörün Seçimleri Yönetimi</h1>
                    <p className="text-muted-foreground">
                        Premium içerik ve hisse analizlerini buradan yönetin.
                    </p>
                </div>
                <div>
                    <Link href="/admin/editor-choices/new">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Yeni Seçim Ekle
                        </Button>
                    </Link>
                </div>
            </div>

            <EditorChoiceTableClient initialChoices={choices} />
        </div>
    );
}
