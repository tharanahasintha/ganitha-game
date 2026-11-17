export function normalize(value){
 const s=String(value??'').trim();
 if (!s) return '';
 return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s) ? String(Number(s)) : s;
}
export function grade(answers,key,questions){
 return questions.reduce((score,q)=>score+(normalize(answers[q.id])!=='' && normalize(answers[q.id])===normalize(key[q.id].correct) ? q.points : 0),0);
}
export function rankEntries(entries,key,questions,cutoff){
 const rows=entries.filter(p=>!p.excluded).map(p=>({uid:p.uid,name:p.name,score:grade(p.answers||{},key,questions),completedAt:p.submittedAt?.toMillis?.()??cutoff,tieBreak:p.tieBreak??0,reason:p.tieReason||''}));
 rows.sort((a,b)=>b.score-a.score || a.completedAt-b.completedAt || b.tieBreak-a.tieBreak);
 rows.forEach((r,i)=>{const p=rows[i-1];r.rank=p&&p.score===r.score&&p.completedAt===r.completedAt&&p.tieBreak===r.tieBreak?p.rank:i+1;});
 return rows;
}
export function deadline(session){return Math.min(session.closedAt?.toMillis()??Infinity,session.startedAt ? session.startedAt.toMillis()+1200000 : Infinity);}
export function joinURL(href,id){const u=new URL(href);u.hash=`/join/${id}`;return u.href;}
