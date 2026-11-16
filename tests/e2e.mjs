// E2E checks of the homepage demo (Playwright from ~/.veon/tools, system Chrome).
// Usage: node tests/e2e.mjs [url]   default http://localhost:4321/
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";

const toolsDir = path.join(os.homedir(), ".veon", "tools");
const require = createRequire(path.join(toolsDir, "package.json"));
const { chromium } = require("playwright");
let executablePath;
try { executablePath = JSON.parse(fs.readFileSync(path.join(os.homedir(), ".veon", "env.json"), "utf8")).chrome_path; } catch { /* bundled browser */ }

const url = process.argv[2] || "http://localhost:4321/";
const H1 = "Школа іноземних мов у Львові для дітей і дорослих";
const SECTIONS = ["hero", "programy", "umovy", "start", "sadochok", "kontakty"];
const ALLOWED = [/^tel:\+380936755444$/, /^https:\/\/instagram\.com\/school\.clever\.land$/, /^https:\/\/www\.facebook\.com\/cleverland\.lviv$/, /^https:\/\/www\.google\.com\/maps\/search\//, /^#[a-z][\w-]*$/];

let failed = 0;
const ok = (cond, msg) => { console.log(`${cond ? "PASS" : "FAIL"}  ${msg}`); if (!cond) failed += 1; };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ executablePath });
try {
  // 1. No horizontal scroll, key elements inside the screen.
  for (const w of [320, 375, 390, 768, 1024, 1280, 1440]) {
    const page = await browser.newPage({ viewport: { width: w, height: 800 } });
    await page.goto(url, { waitUntil: "networkidle" });
    const r = await page.evaluate(() => {
      const de = document.documentElement;
      const out = [...document.querySelectorAll("header a, header button, .hero a, .hero button, h1")].filter((e) => e.getClientRects().length && getComputedStyle(e).visibility !== "hidden").filter((e) => { const b = e.getBoundingClientRect(); return b.width > 0 && (b.left < -1 || b.right > innerWidth + 1); }).map((e) => e.textContent.trim().slice(0, 30));
      return { sw: de.scrollWidth, cw: de.clientWidth, out };
    });
    ok(r.sw <= r.cw, `${w}px: no horizontal scroll (${r.sw} <= ${r.cw})`);
    ok(r.out.length === 0, `${w}px: header and hero controls inside the screen ${r.out.join(", ")}`);
    await page.close();
  }

  // 2. Structure, links, first-screen call at 390 and 1440.
  for (const [w, h] of [[390, 844], [1440, 900]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.goto(url, { waitUntil: "networkidle" });
    const info = await page.evaluate(() => ({
      h1: [...document.querySelectorAll("h1")].map((e) => e.textContent.trim()),
      ids: [...document.querySelectorAll("main > section[id]")].map((s) => s.id),
      hrefs: [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")),
      lang: document.documentElement.lang,
    }));
    ok(info.h1.length === 1 && info.h1[0] === H1, `${w}px: one H1 equal to the concept`);
    ok(JSON.stringify(info.ids) === JSON.stringify(SECTIONS), `${w}px: sections in concept order (${info.ids.join(", ")})`);
    ok(info.lang === "uk", `${w}px: html lang=uk`);
    const bad = info.hrefs.filter((x) => !ALLOWED.some((re) => re.test(x)) || /cleverland\.org\.ua/i.test(x));
    ok(bad.length === 0, `${w}px: only allowed links ${bad.join(" ")}`);
    const call = await page.evaluate(() => {
      const b = document.querySelector(".hero__call");
      const r = b.getBoundingClientRect();
      return { href: b.getAttribute("href"), inFold: r.top >= 0 && r.bottom <= innerHeight };
    });
    ok(call.href === "tel:+380936755444" && call.inFold, `${w}px: hero call button is tel: and visible without scrolling`);
    const headerCall = await page.evaluate(() => [...document.querySelectorAll(".site-header a[href^='tel:']")].some((a) => a.getClientRects().length && a.getBoundingClientRect().width > 0));
    ok(headerCall, `${w}px: call in the sticky header`);
    await page.close();
  }

  // 3. Signature: switcher changes every caption.
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(url, { waitUntil: "networkidle" });
    await page.click('[data-switcher] button[data-lang="es"]');
    await wait(500);
    const s = await page.evaluate(() => [...document.querySelectorAll("[data-gloss]")].every((e) => e.lang === "es" && e.textContent === e.dataset.es));
    const pressed = await page.getAttribute('[data-switcher] button[data-lang="es"]', "aria-pressed");
    ok(s && pressed === "true", "switcher: Español applied to all captions, aria-pressed set");

    // 4. Tabs on desktop.
    await page.click("#tab-dorosli");
    await wait(300);
    const vis = await page.evaluate(() => [...document.querySelectorAll("[data-panel]")].map((p) => [p.dataset.panel, getComputedStyle(p).display !== "none"]));
    ok(JSON.stringify(vis) === JSON.stringify([["doshkilnyata", false], ["shkolyari", false], ["dorosli", true]]), "tabs: Дорослі opens its entry only");
    await page.focus("#tab-dorosli");
    await page.keyboard.press("ArrowUp");
    const sel = await page.getAttribute("#tab-shkolyari", "aria-selected");
    ok(sel === "true", "tabs: arrow keys move selection");
    await page.click('.hero a[data-program="doshkilnyata"]');
    await wait(900);
    const sel2 = await page.getAttribute("#tab-doshkilnyata", "aria-selected");
    ok(sel2 === "true", "hero audience link opens the matching programme");

    // 5. FutureLink shows its note on focus and has no href.
    await page.focus("#prog-doshkilnyata .btn--call");
    await page.keyboard.press("Tab");
    await wait(300);
    const note = await page.evaluate(() => { const f = document.activeElement; return { op: getComputedStyle(f.querySelector(".future-link__note")).opacity, href: f.getAttribute("href"), dis: f.getAttribute("aria-disabled"), txt: f.querySelector(".future-link__note").textContent }; });
    ok(note.op === "1" && note.href === null && note.dis === "true" && note.txt === "Розділ у розробці", "FutureLink: note on focus, no href, aria-disabled");
    await page.close();
  }

  // 6. Mobile menu and anchors.
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(url, { waitUntil: "networkidle" });
    await page.click(".menu-toggle");
    await wait(300);
    const open = await page.evaluate(() => getComputedStyle(document.getElementById("site-nav")).visibility === "visible");
    ok(open, "390px: burger opens the menu");
    await page.click('#site-nav a[href="#kontakty"]');
    await wait(1200);
    const st = await page.evaluate(() => ({ exp: document.querySelector(".menu-toggle").getAttribute("aria-expanded"), top: document.getElementById("kontakty").getBoundingClientRect().top }));
    ok(st.exp === "false" && Math.abs(st.top - 60) < 4, `390px: anchor Контакти scrolls below the sticky header, menu closes (top ${Math.round(st.top)})`);
    await page.close();
  }

  // 7. Reduced motion: captions change at once.
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: "networkidle" });
    await page.click('[data-switcher] button[data-lang="de"]');
    const s = await page.evaluate(() => [...document.querySelectorAll("[data-gloss]")].every((e) => e.lang === "de" && getComputedStyle(e).opacity === "1"));
    ok(s, "reduced motion: captions switch instantly");
    await ctx.close();
  }

  // 8. Scripts off: content visible, captions in English.
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: "networkidle" });
    const s = await page.evaluate(() => [...document.querySelectorAll("[data-panel]")].every((p) => getComputedStyle(p).display !== "none") && getComputedStyle(document.querySelector(".route__line")).opacity === "1");
    ok(s, "no JS: all programmes and the route line visible");
    await ctx.close();
  }
} finally {
  await browser.close();
}
console.log(failed ? `RESULT: FAIL (${failed})` : "RESULT: PASS");
process.exit(failed ? 1 : 0);
