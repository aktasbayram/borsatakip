import { db } from "@/lib/db";
import { EditorChoiceForm } from "../editor-choice-form";
import { notFound } from "next/navigation";

interface EditEditorChoicePageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditEditorChoicePage(props: EditEditorChoicePageProps) {
    const params = await props.params;
    let choice = null;
    try {
        // @ts-ignore
        choice = await db.editorChoice.findUnique({
            where: { id: params.id }
        });
    } catch (error) {
        console.error("Failed to fetch editor choice:", error);
    }

    if (!choice) {
        return notFound();
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Analizi Düzenle</h1>
                <p className="text-muted-foreground">
                    Hisse analizini ve yorumlarını güncelleyin.
                </p>
            </div>

            <div className="bg-card border rounded-xl p-6 shadow-sm">
                <EditorChoiceForm initialData={choice} />
            </div>
        </div>
    );
}
