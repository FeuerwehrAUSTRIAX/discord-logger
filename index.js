import puppeteer from 'puppeteer';
import fs from 'fs';

const csvUrl = 'https://einsatzuebersicht.lfv.steiermark.at/lfvasp/einsatzkarte/Public.aspx?view=24';

(async () => {
  console.log('🚀 Starte Headless-Browser...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Lade eine Seite, damit Cookies etc. gesetzt werden
  console.log('🌐 Lade Einsatz-Übersichtsseite...');
  await page.goto('https://einsatzuebersicht.lfv.steiermark.at/lfvasp/einsatzkarte/Liste_App_Public.html?Bereich=all', {
    waitUntil: 'networkidle0',
    timeout: 0
  });

  // Dann lade die CSV direkt
  console.log('📥 Lade CSV...');
  const csvResponse = await page.goto(csvUrl, { timeout: 0 });
  const csvBuffer = await csvResponse.buffer();

  const filename = 'einsaetze.csv';
  fs.writeFileSync(filename, csvBuffer);
  console.log(`✅ CSV gespeichert als "${filename}"`);

  await browser.close();
})();
