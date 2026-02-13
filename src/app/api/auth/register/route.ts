
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, name, phoneNumber } = body;

        if (!email || !password) {
            return NextResponse.json(
                { message: 'Email ve şifre zorunludur.' },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: 'Bu email adresi zaten kullanılıyor.' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || '',
                phoneNumber: phoneNumber || null,
            },
        });

        return NextResponse.json(
            { message: 'Kullanıcı başarıyla oluşturuldu.', user: { email: user.email, name: user.name } },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { message: 'Bir hata oluştu.' },
            { status: 500 }
        );
    }
}
