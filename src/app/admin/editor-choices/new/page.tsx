import { db } from "@/lib/db";
import { EditorChoiceForm } from "../editor-choice-form";
import { redirect } from "next/navigation";

export default async function NewEditorChoicePage() {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Yeni Analiz Ekle</h1>
                <p className="text-muted-foreground">
                    Editörün Seçimleri için yeni bir hisse analizi paylaşın.
                </p>
            </div>

            <div className="bg-card border rounded-xl p-6 shadow-sm">
                <EditorChoiceForm />
            </div>
        </div>
    );
}
