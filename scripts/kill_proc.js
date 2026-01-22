try {
    process.kill(parseInt(process.argv[2]), 'SIGTERM');
} catch (e) {
    console.log('Process already dead');
}
