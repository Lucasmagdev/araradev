const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  const file = 'file:///' + path.join(__dirname, 'app', 'index.html').replace(/\\/g, '/');
  await page.goto(file, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000)); // wait for canvas + fonts
  await page.screenshot({ path: path.join(__dirname, 'screen.png'), fullPage: false });
  await browser.close();
  console.log('done');
})();
