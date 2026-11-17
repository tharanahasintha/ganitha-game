export const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const $=s=>document.querySelector(s);
export function button(label,action,cls=''){return `<button class="${cls}" data-action="${action}">${label}</button>`;}
export function shell(content,teacher=false){
 $('#app').innerHTML=`<header><a class="brand" href="#/"><span class="logo">🧩</span><span>ගණිත රහස් මෙහෙයුම<small>හිතන්න • විසඳන්න • ජයගන්න</small></span></a><nav><span class="live-dot"></span><span>සා/පෙළ • 11 ශ්‍රේණිය</span>${teacher?button('ඉවත් වන්න','logout','ghost'): '<a class="teacher-link" href="#/teacher">ගුරු පිවිසුම ↗</a>'}</nav></header><main>${content}</main><footer><span>පුංචි අදහසක්. ලොකු ජයග්‍රහණයක්.</span><span>MATHEMATICS × CURIOSITY</span></footer><div id="toast" role="status"></div>`;
}
export function toast(message){const t=$('#toast');if(t){t.textContent=message;t.classList.add('visible');setTimeout(()=>t.classList.remove('visible'),6000);}}
export function message(title,text,icon='✨'){shell(`<section class="card centered"><div class="orb">${icon}</div><h1>${title}</h1><p>${escape(text)}</p></section>`);}
export function confetti(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const c=document.createElement('div');c.className='confetti';for(let i=0;i<45;i++){const p=document.createElement('i');p.style.cssText=`left:${Math.random()*100}%;animation-delay:${Math.random()*2}s;background:${['#52ddc1','#b39aff','#f4ca78'][i%3]}`;c.append(p);}document.body.append(c);setTimeout(()=>c.remove(),6500);}
