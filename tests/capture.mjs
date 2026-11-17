import {chromium} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
await mkdir('screenshots',{recursive:true});
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
await page.goto('http://127.0.0.1:5173');await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'screenshots/home-desktop.png',fullPage:true});
await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:5173/#/demo');await page.locator('.quiz-card').waitFor();await page.screenshot({path:'screenshots/quiz-mobile.png',fullPage:true});await browser.close();
