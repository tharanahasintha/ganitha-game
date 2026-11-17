import {test,expect} from '@playwright/test';
import fs from 'node:fs';
for(const width of [360,390,768,1440]){
 test(`home and quiz fit ${width}px; answers and position resume`,async({page})=>{
  await page.setViewportSize({width,height:900});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await expect(page.locator('.hero h1')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await page.locator('[data-action="demo"]').click();await expect(page.locator('.quiz-card')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await page.locator('[data-action="answer:o1"]').click();await expect(page.locator('.answer.selected')).toHaveCount(1);
  await page.locator('[data-action="goto:3"]').click();await page.locator('#numeric').fill('42');
  await page.reload();await expect(page.locator('#numeric')).toHaveValue('42');
  await page.locator('[data-action="review"]').click();await expect(page.locator('.review-list button')).toHaveCount(15);
  await page.locator('.review-list [data-action="goto:0"]').click();await expect(page.locator('[data-action="answer:o1"]')).toHaveClass(/selected/);
  await page.locator('[data-action="goto:14"]').click();await expect(page.locator('svg.diagram')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();expect(errors).toEqual([]);
 });
}
test('login is gated without configuration; preview final submission requires confirmation',async({page})=>{
 await page.goto('/#/teacher');await expect(page.locator('#login button')).toBeDisabled();
 await page.goto('/#/demo');await page.locator('[data-action="review"]').click();page.once('dialog',d=>d.dismiss());await page.locator('[data-action="submit"]').click();await expect(page.locator('.review-list')).toBeVisible();
 page.once('dialog',d=>d.accept());await page.locator('[data-action="submit"]').click();await expect(page.locator('.centered')).toBeVisible();
});
test('production build works under repository subpath and contains no private seeds',async({page,request})=>{
 await page.goto('http://127.0.0.1:4173/seminar/#/demo');await expect(page.locator('.quiz-card')).toBeVisible();await page.reload();await expect(page.locator('.quiz-card')).toBeVisible();
 expect((await request.get('http://127.0.0.1:4173/seminar/private/answer-key.json')).status()).toBe(404);
 expect((await request.get('http://127.0.0.1:4173/seminar/seed/questions.json')).status()).toBe(404);
 const seed=JSON.parse(fs.readFileSync('seed/questions.json','utf8'));const key=JSON.parse(fs.readFileSync('private/answer-key.json','utf8'));
 const bundles=fs.readdirSync('dist/assets').filter(p=>p.endsWith('.js')).map(p=>fs.readFileSync(`dist/assets/${p}`,'utf8')).join('');
 expect(bundles).not.toContain(key.q12.explanation);expect(bundles).not.toContain(seed[6].text);
});
