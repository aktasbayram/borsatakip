const puppeteer = require('puppeteer');

async function findUrlAndTest() {
    const listUrl = 'https://halkarz.com/k/taslak/';
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    try {
        await page.goto(listUrl, { waitUntil: 'domcontentloaded' });

        const html = await page.evaluate(() => document.body.innerHTML.substring(0, 3000));
        console.log('HTML Snippet:', html);

        const firstIpo = await page.evaluate(() => {
            const link = document.querySelector('article a, .post a, .entry-title a');
            return link ? { title: link.innerText, url: link.href } : null;
        });

        console.log('Found IPO:', firstIpo);

        if (firstIpo && firstIpo.url) {
            await page.goto(firstIpo.url, { waitUntil: 'domcontentloaded' });
            const data = await page.evaluate(() => {
                const liContents = Array.from(document.querySelectorAll('ul.aex-in li')).slice(0, 5).map(li => ({
                    h5: li.querySelector('h5')?.innerText,
                    hasTable: !!li.querySelector('table'),
                    hasP: !!li.querySelector('p'),
                    html: li.innerHTML
                }));

                return {
                    title: document.querySelector('h1')?.innerText,
                    liContents
                };
            });
            console.log('Detail Data:', JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

findUrlAndTest();
