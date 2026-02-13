import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create upload directory if it doesn't exist
        const uploadDir = join(process.cwd(), "public", "uploads");
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (err) {
            // Directory might already exist
        }

        const filename = `${randomUUID()}-${file.name.replace(/\s+/g, "-")}`;
        const path = join(uploadDir, filename);

        await writeFile(path, buffer);
        const url = `/uploads/${filename}`;

        return NextResponse.json({ success: true, url });
    } catch (error: any) {
        console.error("Upload API Error:", error);
        return NextResponse.json({ error: "Sunucu hatası", details: error.message }, { status: 500 });
    }
}
