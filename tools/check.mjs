// Teste no navegador do build de produção: `npm run build && npm run check`.
// Serve dist (rota desconhecida → index.csr.html, como o 404.html do Pages), abre o Chrome
// headless via CDP e verifica: erros de console, requisições ao Firestore e conteúdo das páginas.
// Requer Google Chrome instalado (caminho padrão do Windows abaixo).
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

const root = join(process.argv[2] ?? '.', 'dist/blog-de-notas-app/browser');
const BASE = 'http://localhost:4310';
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.ico': 'image/x-icon' };
const server = createServer((req, res) => {
  let file = join(root, decodeURIComponent(req.url.split('?')[0]));
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) file = join(root, 'index.csr.html');
  res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
}).listen(4310);

const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--remote-debugging-port=9334', '--no-first-run', '--user-data-dir=' + join(process.env.TEMP, 'blog-check-profile'), 'about:blank',
]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 40 && !target; i++) {
  await sleep(250);
  try { target = (await (await fetch('http://127.0.0.1:9334/json')).json()).find((t) => t.type === 'page'); } catch {}
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let id = 0;
const pending = new Map();
const problems = [];
let firestoreRequests = [];
ws.addEventListener('message', ({ data }) => {
  const msg = JSON.parse(data);
  if (msg.id) pending.get(msg.id)?.(msg);
  if (msg.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(msg.params.type))
    problems.push(`console.${msg.params.type}: ` + msg.params.args.map((a) => a.value ?? a.description).join(' '));
  if (msg.method === 'Runtime.exceptionThrown') problems.push('exception: ' + msg.params.exceptionDetails.exception?.description);
  if (msg.method === 'Log.entryAdded' && ['error', 'warning'].includes(msg.params.entry.level))
    problems.push(`log.${msg.params.entry.source}: ${msg.params.entry.text}`);
  if (msg.method === 'Network.requestWillBeSent' && msg.params.request.url.includes('firestore.googleapis.com'))
    firestoreRequests.push(msg.params.request.url.replace(/\?.*/, ''));
});
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result?.result?.value;
const go = async (url) => { await send('Page.navigate', { url }); await sleep(3500); };

await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable'); await send('Network.enable');
const out = {};

await go(`${BASE}/`);
out.home = await evaluate(`document.title + ' | cards=' + document.querySelectorAll('.note').length + ' | primeiro=' + (document.querySelector('.note h2')?.textContent ?? '-')`);
out.firestoreNaHome = firestoreRequests.length; // esperado 0: dados vêm no HTML (TransferState)
const firstSlug = await evaluate(`document.querySelector('.note')?.getAttribute('href')?.replace(/^\\//, '') ?? ''`);

firestoreRequests = [];
await evaluate(`document.querySelector('.note')?.click()`);
await sleep(3000);
out.navegacaoInterna = await evaluate(`location.pathname + ' | ' + document.title + ' | corpo=' + (document.querySelector('.prose')?.textContent.trim().slice(0, 40) ?? '-')`);
out.firestoreNaNavegacao = firestoreRequests.length; // > 0 é normal: navegação interna busca no Firestore

if (firstSlug) {
  firestoreRequests = [];
  await go(`${BASE}/${firstSlug}`);
  out.postDireto = await evaluate(`document.title + ' | corpo=' + (document.querySelector('.prose')?.textContent.trim().slice(0, 40) ?? '-')`);
  out.firestoreNoPostDireto = firestoreRequests.length; // esperado 0: página pré-renderizada
}

firestoreRequests = [];
await go(`${BASE}/nao-existe-esse-post`);
out.postInexistente = await evaluate(`document.querySelector('h1')?.textContent + ' | robots=' + document.querySelector('meta[name=robots]')?.content`);

console.log(JSON.stringify(out, null, 2));
console.log(problems.length ? 'PROBLEMAS:\n' + [...new Set(problems)].join('\n') : 'Nenhum erro de console.');
ws.close(); chrome.kill(); server.close();
process.exit(0);
