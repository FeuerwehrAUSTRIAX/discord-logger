import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  console.log("Lade Seite...");

  await page.goto('https://einsatzuebersicht.lfv.steiermark.at/lfvasp/einsatzkarte/Liste_App_Public.html?Bereich=all', {
    waitUntil: 'networkidle0'
  });

  console.log("Seite geladen – CSV-Link wird gesucht...");

  const csvUrl = 'https://einsatzuebersicht.lfv.steiermark.at/lfvasp/einsatzkarte/Public.aspx?view=24';
  const csvResponse = await page.goto(csvUrl);
  const csvBuffer = await csvResponse.buffer();

  fs.writeFileSync('einsaetze.csv', csvBuffer);
  console.log('✅ CSV gespeichert!');

  await browser.close();
})();
