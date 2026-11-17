import { defineConfig } from 'vite';
export default defineConfig({
 base:'./',
 build:{rollupOptions:{output:{manualChunks:{
  'firebase-firestore':['firebase/firestore'],
  'firebase-auth':['firebase/auth'],
  qr:['qrcode']
 }}}}
});
