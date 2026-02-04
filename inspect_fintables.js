const https = require('https');
const fs = require('fs');

const options = {
    hostname: 'fintables.com',
    path: '/tedbirli-hisseler',
    method: 'GET',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        fs.writeFileSync('fintables.html', data, 'utf-8');
        console.log('Saved ' + data.length + ' bytes');
    });
});

req.on('error', (e) => console.error(e));
req.end();
