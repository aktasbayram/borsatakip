
module.exports = {
    apps: [
        {
            name: 'borsa-web',
            script: 'node_modules/next/dist/bin/next',
            args: 'start',
            env: {
                NODE_ENV: 'production',
                PORT: 3000
            }
        },
        {
            name: 'borsa-worker',
            // Use ts-node directly to run the worker
            script: 'node_modules/ts-node/dist/bin.js',
            args: '-r tsconfig-paths/register --project tsconfig.script.json scripts/alert-worker.ts',
            env: {
                NODE_ENV: 'production'
            }
        }
    ]
};
