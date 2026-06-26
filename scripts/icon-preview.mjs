import fs from "fs";
import puppeteer from "puppeteer";
const svg = fs.readFileSync("app/icon.svg", "utf8");
const browser = await puppeteer.launch({ headless: true, executablePath: process.env.CHROME_PATH || undefined, args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 520, height: 300, deviceScaleFactor: 2 });
await page.setContent(`<div style="display:flex;gap:30px;align-items:center;background:#cfe0f5;height:300px;justify-content:center;font-family:sans-serif">
  <div style="text-align:center"><div style="width:160px;height:160px">${svg.replace('width="64" height="64"','width="160" height="160"')}</div><div style="margin-top:8px;color:#333">160px</div></div>
  <div style="text-align:center"><div style="width:32px;height:32px">${svg.replace('width="64" height="64"','width="32" height="32"')}</div><div style="margin-top:8px;color:#333;font-size:12px">32px (tab)</div></div>
  <div style="text-align:center"><div style="width:16px;height:16px">${svg.replace('width="64" height="64"','width="16" height="16"')}</div><div style="margin-top:8px;color:#333;font-size:12px">16px</div></div>
</div>`);
await page.screenshot({ path: "docs/icon-preview.png" });
console.log("done");
await browser.close();
process.exit(0);
