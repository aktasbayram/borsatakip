const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Updating package SMS credits...');

    const updates = [
        { name: 'FREE', credits: 5 },
        { name: 'BASIC', credits: 10 },
        { name: 'PRO', credits: 50 },
    ];

    for (const update of updates) {
        try {
            // Find package by name (internal name)
            // Note: The internal names might be different in your DB, checking consistency.
            // Based on previous files, names are usually uppercase: FREE, BASIC, PRO.

            const pkg = await prisma.package.findFirst({
                where: { name: update.name }
            });

            if (pkg) {
                await prisma.package.update({
                    where: { id: pkg.id },
                    data: { smsCredits: update.credits }
                });
                console.log(`Updated ${update.name} to ${update.credits} SMS credits.`);
            } else {
                console.log(`Package ${update.name} not found.`);
            }
        } catch (e) {
            console.error(`Error updating ${update.name}:`, e);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
