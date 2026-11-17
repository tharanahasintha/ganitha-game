import {test, before,after,beforeEach} from 'node:test';
import fs from 'node:fs';
import {initializeTestEnvironment,assertSucceeds,assertFails} from '@firebase/rules-unit-testing';
import {doc,setDoc,getDoc,getDocs,collection,updateDoc,writeBatch,serverTimestamp,Timestamp,onSnapshot} from 'firebase/firestore';
let env;
const enabled=!!process.env.FIRESTORE_EMULATOR_HOST;
const suite=enabled?test:test.skip;
const qs=JSON.parse(fs.readFileSync(new URL('../seed/questions.json',import.meta.url)));
const order=Object.fromEntries(qs.map(q=>[q.id,q.options.map(o=>o.id)]));
const waiting={owner:'teacher',status:'waiting',duration:1200,createdAt:Timestamp.now(),startedAt:null,closedAt:null,resultsPublished:false,answersReleased:false};
before(async()=>{if(enabled)env=await initializeTestEnvironment({projectId:'demo-ganitha',firestore:{rules:fs.readFileSync('firestore.rules','utf8')}});});
after(async()=>{if(env)await env.cleanup();});
beforeEach(async()=>{if(!env)return;await env.clearFirestore();await env.withSecurityRulesDisabled(async c=>{const d=c.firestore();await setDoc(doc(d,'teachers/teacher'),{enabled:true});await setDoc(doc(d,'sessions/game'),waiting);await setDoc(doc(d,'sessions/game/questions/q1'),qs[0]);await setDoc(doc(d,'sessions/game/keys/main'),{q1:{correct:'o1'}});});});
const db=uid=>env.authenticatedContext(uid).firestore();
async function join(uid,name='Same name'){const d=db(uid),b=writeBatch(d);b.set(doc(d,`sessions/game/participants/${uid}`),{name,joinedAt:serverTimestamp(),excluded:false,reason:'',tieBreak:0,tieReason:''});b.set(doc(d,`sessions/game/answers/${uid}`),{answers:{},order,submittedAt:null,updatedAt:serverTimestamp()});return b.commit();}
const start=()=>updateDoc(doc(db('teacher'),'sessions/game'),{status:'running',startedAt:serverTimestamp()});
function until(ref,predicate){return new Promise((resolve,reject)=>{const timeout=setTimeout(()=>{un();reject(Error('Listener timeout'));},6000);const un=onSnapshot(ref,s=>{if(predicate(s)){clearTimeout(timeout);un();resolve(s);}},e=>{clearTimeout(timeout);reject(e);});});}
suite('realtime names/count, both phones start, and published results notify listeners',async()=>{
 const t=db('teacher'),a=db('a'),b=db('b');
 const names=until(collection(t,'sessions/game/participants'),s=>s.size===2);
 await join('a');await join('b');await names;
 const phoneA=until(doc(a,'sessions/game'),s=>s.data().status==='running');const phoneB=until(doc(b,'sessions/game'),s=>s.data().status==='running');
 await start();await Promise.all([phoneA,phoneB]);
 await updateDoc(doc(t,'sessions/game'),{status:'closed',closedAt:serverTimestamp()});
 await setDoc(doc(t,'sessions/game/results/a'),{uid:'a',name:'Same name',score:10,completedAt:Date.now(),tieBreak:0,reason:'',rank:1});
 await assertFails(getDoc(doc(a,'sessions/game/results/a')));
 const released=until(doc(a,'sessions/game'),s=>s.data().resultsPublished);
 await updateDoc(doc(t,'sessions/game'),{resultsPublished:true});await released;await assertSucceeds(getDoc(doc(a,'sessions/game/results/a')));
});
suite('teacher atomically creates a session, public questions and separate private key',async()=>{
 const d=db('teacher'),batch=writeBatch(d);batch.set(doc(d,'sessions/newgame'),{...waiting,createdAt:serverTimestamp()});
 for(const q of qs)batch.set(doc(d,`sessions/newgame/questions/${q.id}`),q);
 batch.set(doc(d,'sessions/newgame/keys/main'),{q1:{correct:'o1'}});await assertSucceeds(batch.commit());
 await assertFails(getDoc(doc(db('stranger'),'sessions/newgame/keys/main')));
});
suite('only allowlisted teacher controls sessions; allowlist protected',async()=>{
 await assertFails(updateDoc(doc(db('intruder'),'sessions/game'),{status:'running',startedAt:serverTimestamp()}));
 await assertFails(setDoc(doc(db('intruder'),'teachers/intruder'),{enabled:true}));await assertSucceeds(start());
 await assertFails(updateDoc(doc(db('teacher'),'sessions/game'),{startedAt:serverTimestamp()}));
});
suite('duplicate names use separate UID records; lobby joins only, identity immutable',async()=>{
 await assertSucceeds(join('a'));await assertSucceeds(join('b'));
 await assertFails(updateDoc(doc(db('a'),'sessions/game/participants/a'),{name:'Changed'}));
 await start();await assertFails(join('c'));await assertSucceeds(getDoc(doc(db('a'),'sessions/game/participants/a')));
});
suite('waiting hides questions and keys; own answers only',async()=>{
 await join('a');await join('b');const a=db('a');await assertFails(getDoc(doc(a,'sessions/game/questions/q1')));await assertFails(getDoc(doc(a,'sessions/game/keys/main')));
 await assertFails(getDoc(doc(a,'sessions/game/answers/b')));await assertFails(getDocs(collection(a,'sessions/game/answers')));await start();await assertSucceeds(getDoc(doc(a,'sessions/game/questions/q1')));await assertFails(getDoc(doc(db('stranger'),'sessions/game/questions/q1')));
});
suite('draft validation, atomic final submit, locked afterward',async()=>{
 await join('a');await start();const r=doc(db('a'),'sessions/game/answers/a');
 await assertFails(updateDoc(r,{answers:{q99:'o1'},updatedAt:serverTimestamp()}));await assertFails(updateDoc(r,{answers:{q1:'o9'},updatedAt:serverTimestamp()}));
 await assertSucceeds(updateDoc(r,{answers:{q1:'o1',q4:'12'},updatedAt:serverTimestamp()}));
 await assertSucceeds(updateDoc(r,{answers:{q1:'o1'},updatedAt:serverTimestamp(),submittedAt:serverTimestamp()}));
 await assertFails(updateDoc(r,{answers:{q1:'o0'},updatedAt:serverTimestamp()}));
});
suite('server deadline rejects late writes without teacher present',async()=>{
 await join('a');await env.withSecurityRulesDisabled(c=>updateDoc(doc(c.firestore(),'sessions/game'),{status:'running',startedAt:Timestamp.fromMillis(Date.now()-1201000)}));
 await assertFails(updateDoc(doc(db('a'),'sessions/game/answers/a'),{answers:{q1:'o1'},updatedAt:serverTimestamp()}));
});
suite('early closure stops writes; only teacher publishes and releases',async()=>{
 await join('a');await start();const a=db('a'),t=db('teacher');
 await assertFails(updateDoc(doc(a,'sessions/game'),{resultsPublished:true}));
 await assertFails(updateDoc(doc(t,'sessions/game'),{resultsPublished:true}));
 await updateDoc(doc(t,'sessions/game'),{status:'closed',closedAt:serverTimestamp()});
 await assertFails(updateDoc(doc(a,'sessions/game/answers/a'),{answers:{q1:'o1'},updatedAt:serverTimestamp()}));
 await assertFails(setDoc(doc(a,'sessions/game/results/a'),{score:300}));
 await assertSucceeds(updateDoc(doc(t,'sessions/game'),{resultsPublished:true}));
 await assertSucceeds(updateDoc(doc(t,'sessions/game'),{answersReleased:true}));await assertSucceeds(getDoc(doc(a,'sessions/game/keys/main')));
});
