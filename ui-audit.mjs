import { chromium } from "playwright";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3000";
const SHOT = "C:\\Users\\ronad\\AppData\\Local\\Temp\\opencode";
const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox","--disable-gpu"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const consoleErrors = [], pageErrors = [];
page.on("console", m => { if (m.type()==="error") consoleErrors.push(m.text()); });
page.on("pageerror", e => pageErrors.push(e.message));

async function login(role){
  await page.goto(BASE+"/login",{waitUntil:"networkidle"}); await page.waitForTimeout(300);
  await page.locator(`button:has-text("${role}")`).first().click();
  await page.waitForURL("**/map",{timeout:8000}).catch(()=>{});
  await page.waitForTimeout(800);
}

async function audit(label, path, role){
  if (role) await login(role);
  await page.goto(BASE+path,{waitUntil:"networkidle"});
  await page.waitForTimeout(1800);
  const m = await page.evaluate(()=>{
    const cs = (sel)=>{ const e=document.querySelector(sel); return e?getComputedStyle(e):null; };
    const body = cs("body");
    const h1 = cs("h1");
    const overflowX = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    const card = cs(".rounded-xl, .rounded-2xl, [class*='rounded']");
    return {
      overflowX,
      font: body?.fontFamily?.split(",")[0],
      bg: body?.backgroundColor,
      fg: body?.color,
      h1size: h1?.fontSize, h1weight: h1?.fontWeight,
      cardBg: card?.backgroundColor, cardBorder: card?.borderColor,
    };
  });
  await page.screenshot({ path: `${SHOT}/ui-${label}.png`, fullPage: false }).catch(()=>{});
  console.log(`\n== ${label} (${path}) ==`);
  console.log("  overflowX:", m.overflowX, "| font:", m.font, "| bg:", m.bg, "| fg:", m.fg);
  console.log("  h1:", m.h1size, "w"+m.h1weight, "| cardBg:", m.cardBg, "| cardBorder:", m.cardBorder);
}

await audit("landing","/", null);
await audit("login","/login", null);
await audit("map","/map","Citizen");
await audit("reports","/reports","Citizen");
await audit("profile","/profile","Citizen");
await audit("analytics","/analytics","Authority");
await audit("authority","/authority","Authority");

console.log("\n=== CONSOLE ERRORS ("+consoleErrors.length+") ===\n"+consoleErrors.slice(0,15).join("\n"));
console.log("=== PAGE ERRORS ("+pageErrors.length+") ===\n"+pageErrors.slice(0,15).join("\n"));
await browser.close();
