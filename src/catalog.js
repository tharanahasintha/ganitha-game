// Only public format metadata belongs in the student bundle. Question text is imported locally by the teacher.
const numeric=new Set([4,7,8,10,11,13,14]);
export default Array.from({length:15},(_,i)=>({id:`q${i+1}`,number:i+1,points:10*(Math.floor(i/5)+1),options:numeric.has(i+1)?[]:['o0','o1','o2','o3'].map(id=>({id}))}));
