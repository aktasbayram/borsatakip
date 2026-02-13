'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Check, X, Loader2 } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';

interface SmsCreditEditorProps {
    userId: string;
    initialCredits: number;
}

export function SmsCreditEditor({ userId, initialCredits }: SmsCreditEditorProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [credits, setCredits] = useState(initialCredits);
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const router = useRouter();

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ smsCredits: credits }),
            });

            if (!res.ok) throw new Error('Güncelleme başarısız');

            enqueueSnackbar('SMS kredisi güncellendi', { variant: 'success' });
            setIsEditing(false);
            router.refresh();
        } catch (error) {
            enqueueSnackbar('Hata oluştu', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-1 animate-in fade-in zoom-in duration-200">
                <Input
                    type="number"
                    value={credits}
                    onChange={(e) => setCredits(parseInt(e.target.value) || 0)}
                    className="w-16 h-7 bg-background border-input text-foreground text-center font-bold px-1"
                    autoFocus
                />
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 hover:bg-green-500/20 text-green-500"
                    onClick={handleSave}
                    disabled={loading}
                >
                    {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 hover:bg-red-500/20 text-red-500"
                    onClick={() => {
                        setIsEditing(false);
                        setCredits(initialCredits);
                    }}
                    disabled={loading}
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 group cursor-pointer justify-center md:justify-start" onClick={() => setIsEditing(true)}>
            <span className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {initialCredits}
            </span>
            <Pencil className="h-3 w-3 text-gray-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
        </div>
    );
}
