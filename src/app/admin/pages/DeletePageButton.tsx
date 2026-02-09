"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useSnackbar } from "notistack";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useState } from "react";

export function DeletePageButton({ id }: { id: string }) {
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm("Bu sayfayı silmek istediğinize emin misiniz?")) return;

        setLoading(true);
        try {
            await axios.delete(`/api/admin/pages/${id}`);
            enqueueSnackbar("Sayfa silindi.", { variant: "success" });
            router.refresh();
        } catch (error) {
            enqueueSnackbar("Silinirken hata oluştu.", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button variant="ghost" size="icon" onClick={handleDelete} disabled={loading} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
            <Trash2 className="w-4 h-4" />
        </Button>
    );
}
