import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const e=import.meta.env;
export const configured=Boolean(e.VITE_FIREBASE_API_KEY && e.VITE_FIREBASE_PROJECT_ID);
const app=configured ? initializeApp({apiKey:e.VITE_FIREBASE_API_KEY,authDomain:e.VITE_FIREBASE_AUTH_DOMAIN,projectId:e.VITE_FIREBASE_PROJECT_ID,appId:e.VITE_FIREBASE_APP_ID}) : null;
export const auth=app ? getAuth(app) : null;
export const db=app ? getFirestore(app) : null;
export const persistence=auth ? setPersistence(auth,browserLocalPersistence) : Promise.resolve();
