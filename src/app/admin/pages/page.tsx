import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, ExternalLink, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DeletePageButton } from "./DeletePageButton";

export default async function PagesAdminPage() {
    const session = await auth();

    if (session?.user?.role !== "ADMIN") {
        redirect("/");
    }
    const pages = await prisma.page.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sayfalar</h1>
                    <p className="text-muted-foreground">
                        Site içi statik sayfaları (Gizlilik, Sözleşmeler vb.) yönetin.
                    </p>
                </div>
                <Link href="/admin/pages/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Yeni Sayfa Ekle
                    </Button>
                </Link>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Başlık</TableHead>
                            <TableHead>URL (Slug)</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead>Oluşturulma</TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pages.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <FileText className="w-10 h-10 opacity-20" />
                                        <p>Henüz hiç sayfa oluşturulmamış.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            pages.map((page) => (
                                <TableRow key={page.id}>
                                    <TableCell className="font-medium">{page.title}</TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground">/{page.slug}</TableCell>
                                    <TableCell>
                                        <Badge variant={page.isActive ? "default" : "secondary"}>
                                            {page.isActive ? "Yayında" : "Taslak"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {new Date(page.createdAt).toLocaleDateString('tr-TR')}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Link href={`/p/${page.slug}`} target="_blank">
                                            <Button variant="ghost" size="icon" title="Görüntüle">
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                        <Link href={`/admin/pages/${page.id}`}>
                                            <Button variant="ghost" size="icon" title="Düzenle">
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                        <DeletePageButton id={page.id} />
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
