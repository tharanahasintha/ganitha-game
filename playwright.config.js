import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'tests/browser',use:{baseURL:'http://127.0.0.1:5173',headless:true},webServer:[
 {command:'npm run dev -- --port 5173',url:'http://127.0.0.1:5173',reuseExistingServer:true},
 {command:'node tests/serve-dist.js',url:'http://127.0.0.1:4173/seminar/',reuseExistingServer:true}
],reporter:'list'});
