"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import axios from "axios";

export function DeleteIpoButton({ id }: { id: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Bu halka arzı silmek istediğinize emin misiniz?")) return;
        setLoading(true);
        try {
            await axios.delete(`/api/admin/ipos/${id}`);
            router.refresh();
        } catch (error) {
            console.error("Failed to delete", error);
            alert("Silinemedi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button size="icon" variant="ghost" onClick={handleDelete} disabled={loading} className="text-red-500 hover:text-red-600 hover:bg-red-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </Button>
    );
}
