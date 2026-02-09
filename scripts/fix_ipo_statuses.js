const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixIpoStatuses() {
    console.log('Starting IPO status migration...');

    try {
        // Get all IPOs
        const allIpos = await prisma.ipo.findMany();
        console.log(`Found ${allIpos.length} IPOs in database`);

        let updated = 0;

        for (const ipo of allIpos) {
            let newStatus = ipo.status;

            // Normalize to uppercase
            if (ipo.status === 'Draft' || ipo.status === 'draft') {
                newStatus = 'DRAFT';
            } else if (ipo.status === 'Active' || ipo.status === 'active') {
                newStatus = 'ACTIVE';
            } else if (ipo.status === 'New' || ipo.status === 'new') {
                newStatus = 'NEW';
            }

            // Update if changed
            if (newStatus !== ipo.status) {
                await prisma.ipo.update({
                    where: { id: ipo.id },
                    data: { status: newStatus }
                });
                updated++;
                console.log(`Updated ${ipo.code}: ${ipo.status} -> ${newStatus}`);
            }
        }

        console.log(`\nMigration complete! Updated ${updated} records.`);

        // Show summary
        const summary = await prisma.ipo.groupBy({
            by: ['status'],
            _count: true
        });

        console.log('\nCurrent status distribution:');
        summary.forEach(s => {
            console.log(`  ${s.status}: ${s._count}`);
        });

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixIpoStatuses();
