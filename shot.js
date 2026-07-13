const puppeteer = require('puppeteer');
const fs = require('fs');
const sleep = ms => new Promise(r => setTimeout(r, ms));
if (!fs.existsSync('ux')) fs.mkdirSync('ux');
(async () => {
  const b = await puppeteer.launch({ headless: 'new', defaultViewport: { width: 1200, height: 900 } });
  const p = await b.newPage();
  await p.goto('http://localhost:5173', { waitUntil: 'networkidle0' }); await sleep(1200);
  await p.screenshot({ path: 'ux/lp-1.png' });
  await p.evaluate(() => window.scrollBy(0, 820)); await sleep(600);
  await p.screenshot({ path: 'ux/lp-2.png' });
  await p.evaluate(() => window.scrollBy(0, 820)); await sleep(600);
  await p.screenshot({ path: 'ux/lp-3.png' });
  await b.close();
})();
