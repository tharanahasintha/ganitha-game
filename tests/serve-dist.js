// Local verification helper only. Production is static GitHub Pages hosting.
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('dist');
createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost');if(!url.pathname.startsWith('/seminar/'))throw Error();
 const path=resolve(root,decodeURIComponent(url.pathname.slice(9))||'index.html');if(path!==root&&!path.startsWith(root+sep))throw Error();
 const content=await readFile(path);res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml'})[extname(path)]||'application/octet-stream');res.end(content);
 }catch{res.statusCode=404;res.end('Not found');}}).listen(4173,'127.0.0.1');
