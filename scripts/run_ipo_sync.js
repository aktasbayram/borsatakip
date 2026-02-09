const { IpoService } = require('../src/services/market/ipo-service.ts');

async function runSync() {
    console.log('Starting IPO sync...');
    console.log('This will fetch all IPOs including ~200 drafts from halkarz.com');
    console.log('Please wait, this may take 2-3 minutes...\n');

    try {
        const result = await IpoService.syncIpos();

        console.log('\n=== SYNC COMPLETED ===');
        console.log(`Added: ${result.added}`);
        console.log(`Updated: ${result.updated}`);
        console.log(`Errors: ${result.errors}`);
        console.log('\nDetailed logs:');
        result.logs.forEach(log => console.log(`  - ${log}`));

    } catch (error) {
        console.error('Sync failed:', error);
        process.exit(1);
    }
}

runSync();
