// Captures UI screenshots of the running studio (http://localhost:3333) into docs/.
import puppeteer from "puppeteer";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Set CHROME_PATH to a Chrome/Chromium executable, or rely on puppeteer's own.
const browser = await puppeteer.launch({
  headless: true,
  executablePath: process.env.CHROME_PATH || undefined,
  defaultViewport: { width: 1680, height: 920, deviceScaleFactor: 1 },
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.goto("http://localhost:3333", { waitUntil: "networkidle2", timeout: 60000 });
await page.waitForSelector(".player-wrap", { timeout: 30000 });
await sleep(2500);

// pause + seek to the final frame so the preview shows finished content
async function snap(path) {
  await page.evaluate(() => {
    const p = window.__player;
    if (p) {
      p.pause();
      p.seekTo(100000); // clamps to last frame
    }
  });
  await sleep(600);
  await page.screenshot({ path });
  console.log("shot", path);
}

// 1) Hook Title, horizontal
await snap("docs/ui-hook.png");

// 2) Logo + Contact Card
await page.select("select.control", "brandCard");
await sleep(2200);
await snap("docs/ui-card.png");

// 3) Text Animation + vertical
await page.select("select.control", "textAnim");
await sleep(700);
await page.$$eval(".seg-btn", (btns) => {
  const b = btns.find((x) => x.textContent.includes("Vertical"));
  if (b) b.click();
});
await sleep(2200);
await snap("docs/ui-text-vertical.png");

await browser.close();
process.exit(0);
