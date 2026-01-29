import Link from "next/link";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DeleteIpoButton } from "./delete-ipo-button";

export default async function AdminIposPage() {
    let ipos: any[] = [];
    try {
        // @ts-ignore
        if (db.ipo) {
            // @ts-ignore
            ipos = await db.ipo.findMany({
                orderBy: { createdAt: 'desc' }
            });
        }
    } catch (error) {
        console.error("Failed to fetch IPOs:", error);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Halka Arz Yönetimi</h1>
                    <p className="text-muted-foreground">
                        Manuel halka arz ekleyin veya düzenleyin.
                    </p>
                </div>
                <Link href="/admin/ipos/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Yeni Halka Arz
                    </Button>
                </Link>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Kod</TableHead>
                            <TableHead>Şirket</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead>Tarih</TableHead>
                            <TableHead>İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {ipos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    Henüz manuel eklenmiş halka arz yok.
                                </TableCell>
                            </TableRow>
                        ) : (
                            ipos.map((ipo: any) => (
                                <TableRow key={ipo.id}>
                                    <TableCell className="font-medium">{ipo.code}</TableCell>
                                    <TableCell>{ipo.company}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Badge variant={ipo.status === 'ACTIVE' ? 'default' : ipo.status === 'NEW' ? 'default' : 'secondary'}>
                                                {ipo.status}
                                            </Badge>
                                            {ipo.isNew && <Badge variant="outline" className="border-green-500 text-green-500">YENİ</Badge>}
                                        </div>
                                    </TableCell>
                                    <TableCell>{ipo.date || '-'}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Link href={`/admin/ipos/${ipo.id}`}>
                                                <Button size="icon" variant="ghost">
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <DeleteIpoButton id={ipo.id} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
