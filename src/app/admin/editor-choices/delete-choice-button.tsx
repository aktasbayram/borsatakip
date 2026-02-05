"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { useSnackbar } from "notistack";
import axios from "axios";

interface DeleteEditorChoiceButtonProps {
    id: string;
}

export function DeleteEditorChoiceButton({ id }: DeleteEditorChoiceButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();

    const onDelete = async () => {
        if (!confirm("Bu analizi silmek istediğinize emin misiniz?")) return;

        try {
            setLoading(true);
            await axios.delete(`/api/admin/editor-choices/${id}`);
            enqueueSnackbar("Analiz başarıyla silindi", { variant: "success" });
            router.refresh();
        } catch (error) {
            enqueueSnackbar("Silme işlemi başarısız oldu", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            size="icon"
            variant="ghost"
            onClick={onDelete}
            disabled={loading}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </Button>
    );
}

