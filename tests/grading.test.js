import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {grade,rankEntries,normalize,deadline,joinURL} from '../src/grading.js';
const q=JSON.parse(fs.readFileSync(new URL('../seed/questions.json',import.meta.url)));
const key=JSON.parse(fs.readFileSync(new URL('../private/answer-key.json',import.meta.url)));
test('15 questions, 300 points, every seeded answer grades correctly',()=>{
 assert.equal(q.length,15);assert.equal(q.reduce((n,x)=>n+x.points,0),300);
 const expected=['o1','o2','o3','12','o1','o2','63','1700','o2','644','62','o2','8','18','o2'];
 q.forEach((x,i)=>{assert.equal(key[x.id].correct,expected[i]);assert.equal(grade({[x.id]:expected[i]},key,q),x.points);assert.equal(grade({[x.id]:'wrong'},key,q),0);});
 assert.equal(grade(Object.fromEntries(q.map(x=>[x.id,key[x.id].correct])),key,q),300);assert.equal(grade({},key,q),0);
});
test('numeric normalization rejects blanks, accepts equivalent numeric forms',()=>{assert.equal(normalize(' 1700.00 '),'1700');assert.equal(normalize(''),'');});
test('completion times rank, auto-close shares cutoff, exact ties remain ties',()=>{
 const ts=n=>({toMillis:()=>n});const r=rankEntries([{uid:'a',name:'A',answers:{q1:'o1'},submittedAt:ts(50)},{uid:'b',name:'B',answers:{q1:'o1'}},{uid:'c',name:'C',answers:{q1:'o1'}},{uid:'d',excluded:true}],key,q,100);
 assert.deepEqual(r.map(x=>x.rank),[1,2,2]);assert.deepEqual(r.map(x=>x.completedAt),[50,100,100]);
 const t=rankEntries([{uid:'a',tieBreak:1},{uid:'b',tieBreak:2}],key,q,100);assert.equal(t[0].uid,'b');
});
test('20-minute deadline and early close cutoff cannot extend duration',()=>{
 const ts=n=>({toMillis:()=>n});assert.equal(deadline({startedAt:ts(1000)}),1201000);assert.equal(deadline({startedAt:ts(1000),closedAt:ts(3000)}),3000);assert.equal(deadline({startedAt:ts(1000),closedAt:ts(2000000)}),1201000);
});
test('QR includes complete repository subpath and session',()=>{assert.equal(joinURL('https://example.github.io/maths/#/host/a','xyz'),'https://example.github.io/maths/#/join/xyz');});
