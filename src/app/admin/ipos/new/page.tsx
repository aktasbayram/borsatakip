import { IpoForm } from "@/components/admin/IpoForm";

export default function NewIpoPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Yeni Halka Arz Ekle</h1>
                <p className="text-muted-foreground">
                    Yeni bir halka arz kaydı oluşturun. Aynı "Bist Kodu" varsa botun çektiği veri ezilir.
                </p>
            </div>
            <IpoForm />
        </div>
    );
}
