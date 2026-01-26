
module.exports = {
    apps: [
        {
            name: 'borsa-web',
            script: 'npm',
            args: 'start',
            env: {
                NODE_ENV: 'production',
                PORT: 3000
            }
        },
        {
            name: 'borsa-worker',
            script: 'npm',
            args: 'run worker',
            env: {
                NODE_ENV: 'production'
            }
        }
    ]
};
