import puppeteer from "puppeteer";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({
  headless: true,
  executablePath: process.env.CHROME_PATH || undefined,
  defaultViewport: { width: 1680, height: 920, deviceScaleFactor: 1 },
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.goto("http://localhost:3333/editor", { waitUntil: "networkidle2", timeout: 60000 });
await page.waitForSelector(".handle", { timeout: 30000 });
await sleep(2500);
await page.screenshot({ path: "docs/ui-editor.png" });
console.log("shot docs/ui-editor.png");
await browser.close();
process.exit(0);
