import { db } from './firebase.js';
import { doc, collection, getDocs, getDoc, setDoc, writeBatch, runTransaction, serverTimestamp, onSnapshot } from 'firebase/firestore';
import questions from './catalog.js';
export const ref=(id,...path)=>doc(db,'sessions',id,...path);
export const watch=(id,cb,error)=>onSnapshot(ref(id),s=>cb(s.exists()?{id:s.id,...s.data()}:null),error);
export const watchList=(id,path,cb,error)=>onSnapshot(collection(db,'sessions',id,path),s=>cb(s.docs.map(d=>({uid:d.id,...d.data()}))),error);
export async function createSession(uid,key,bank){
 const r=doc(collection(db,'sessions'));const batch=writeBatch(db);
 batch.set(r,{owner:uid,status:'waiting',duration:1200,createdAt:serverTimestamp(),startedAt:null,closedAt:null,resultsPublished:false,answersReleased:false});
 bank.forEach(q=>batch.set(doc(r,'questions',q.id),q));
 batch.set(doc(r,'keys','main'),key);await batch.commit();return r.id;
}
export async function transition(id,status){
 await runTransaction(db,async tx=>{const r=ref(id);const s=(await tx.get(r)).data();
 if(status==='running'&&s.status==='waiting') tx.update(r,{status,startedAt:serverTimestamp()});
 if(status==='closed'&&s.status==='running') tx.update(r,{status,closedAt:serverTimestamp()});
 });
}
export async function join(id,user,name,order){
 const r=ref(id,'participants',user.uid);await runTransaction(db,async tx=>{
 const p=await tx.get(r);if(p.exists())return;
 tx.set(r,{name,joinedAt:serverTimestamp(),excluded:false,reason:'',tieBreak:0,tieReason:''});
 tx.set(ref(id,'answers',user.uid),{answers:{},order,submittedAt:null,updatedAt:serverTimestamp()});
 });
}
export async function save(id,uid,answers,final=false){
 await setDoc(ref(id,'answers',uid),{answers,updatedAt:serverTimestamp(),...(final?{submittedAt:serverTimestamp()}:{})},{merge:true});
}
export async function fetchQuestions(id){return (await getDocs(collection(db,'sessions',id,'questions'))).docs.map(d=>d.data()).sort((a,b)=>a.number-b.number);}
export async function fetchKey(id){return (await getDoc(ref(id,'keys','main'))).data();}
export async function publish(id,rows){
 // Publish flag is changed only after every result has been acknowledged.
 for(let i=0;i<rows.length;i+=400){const b=writeBatch(db);rows.slice(i,i+400).forEach(r=>b.set(ref(id,'results',r.uid),r));await b.commit();}
 await setDoc(ref(id),{resultsPublished:true},{merge:true});
}
export { questions };
