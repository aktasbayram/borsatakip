import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding started...')

    // Hash password for demo user
    const hashedPassword = await bcrypt.hash('password', 10);

    // Test User
    const user = await prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: { password: hashedPassword }, // Update existing user with hashed password
        create: {
            email: 'user@example.com',
            name: 'Test Kullanıcısı',
            password: hashedPassword,
        },
    })

    console.log({ user })

    // Örnek Watchlist
    const watchlist = await prisma.watchlist.create({
        data: {
            name: 'Favorilerim',
            userId: user.id,
            items: {
                create: [
                    { symbol: 'THYAO', market: 'BIST' },
                    { symbol: 'AAPL', market: 'US' },
                ],
            },
        },
    })

    console.log({ watchlist })

    // Örnek BIST Sembolleri (Genişletilmiş)
    const bistSymbols = [
        { code: 'THYAO', title: 'TURK HAVA YOLLARI' },
        { code: 'ASELS', title: 'ASELSAN' },
        { code: 'GARAN', title: 'TURKIYE GARANTI BANKASI' },
        { code: 'AKBNK', title: 'AKBANK' },
        { code: 'YKBNK', title: 'YAPI VE KREDI BANKASI' },
        { code: 'ISCTR', title: 'TURKIYE IS BANKASI' },
        { code: 'SAHOL', title: 'SABANCI HOLDING' },
        { code: 'KCHOL', title: 'KOC HOLDING' },
        { code: 'TUPRS', title: 'TUPRAS' },
        { code: 'EREGL', title: 'EREGLI DEMIR CELIK' },
        { code: 'SISE', title: 'SISE CAM' },
        { code: 'BIMAS', title: 'BIM MAGAZALAR' },
        { code: 'PETKIM', title: 'PETKIM' },
        { code: 'TCELL', title: 'TURKCELL' },
        { code: 'TTKOM', title: 'TURK TELEKOM' },
        { code: 'FROTO', title: 'FORD OTOSAN' },
        { code: 'TOASO', title: 'TOFAS OTO. FAB.' },
        { code: 'ARCLK', title: 'ARCELIK' },
        { code: 'VESTL', title: 'VESTEL ELEKTRONIK' },
        { code: 'SASA', title: 'SASA POLYESTER' },
        { code: 'HEKTS', title: 'HEKTAS' },
        { code: 'PGSUS', title: 'PEGASUS' },
        { code: 'ENKAI', title: 'ENKA INSAAT' }
    ];

    for (const s of bistSymbols) {
        await prisma.bistSymbol.upsert({
            where: { code: s.code },
            update: {},
            create: s
        })
    }

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
