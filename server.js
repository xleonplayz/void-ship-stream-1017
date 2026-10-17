import http from 'node:http';
const release = 2;
const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Harbor Live</title><link rel="stylesheet" href="/board.css"></head><body><small>HARBOR / LIVE DEPARTURES · RELEASE ${release}</small><h1>Abfahrt in Echtzeit.</h1><p>Drei Sendungen, ein endlicher Datenstrom.</p><button id="start">Abfahrten verfolgen</button><p id="status">Bereit</p><ol id="departures"></ol><p id="timing"></p><script src="/board.js" defer></script></body></html>`;
const css = 'body{font:20px system-ui;max-width:900px;margin:6vh auto;padding:24px;background:#f0eee8;color:#1a3640}h1{font-size:52px}small{color:#367a7b}button{background:#1a6470;color:white;border:0;border-radius:10px;padding:18px;font:inherit;cursor:pointer}li{background:white;padding:24px;margin:12px 0;border-radius:12px}#timing{font-size:16px;color:#45636b}';
const js = `document.querySelector('#start').addEventListener('click',async()=>{const button=document.querySelector('#start');const status=document.querySelector('#status');const list=document.querySelector('#departures');button.disabled=true;list.replaceChildren();status.textContent='Verbindung wird aufgebaut…';const begin=performance.now();let first=null;let count=0;let buffer='';try{const response=await fetch('/stream');if(!response.ok)throw new Error('HTTP '+response.status);const reader=response.body.getReader();const decoder=new TextDecoder();while(true){const next=await reader.read();if(next.done)break;if(first===null)first=Math.round(performance.now()-begin);buffer+=decoder.decode(next.value,{stream:true});const rows=buffer.split('\\n');buffer=rows.pop();for(const row of rows){if(!row)continue;const item=JSON.parse(row);const li=document.createElement('li');li.textContent=item.id+' · '+item.destination+' · '+item.state;list.appendChild(li);count++;status.textContent=count+' von 3 Sendungen';}}if(buffer.trim())throw new Error('incomplete NDJSON line');status.textContent=count===3?'3 Sendungen vollständig':'Unvollständiger Datenstrom';document.querySelector('#timing').textContent='Erstes Paket: '+first+' ms · Gesamt: '+Math.round(performance.now()-begin)+' ms';}catch(e){status.textContent='Fehler: '+e.message;}finally{button.disabled=false;}});`;
const shipments=[{id:'HB-101',destination:'Berlin',state:'Verladen'},{id:'HB-102',destination:'Hamburg',state:'Abgefahren'},{id:'HB-103',destination:'Köln',state:'Unterwegs'}];
http.createServer(async(req,res)=>{
 console.info('ship-stream',release,req.method,req.url);
 if(req.url==='/'){res.writeHead(200,{'content-type':'text/html;charset=utf-8'});res.end(html);return;}
 if(req.url==='/board.js'){res.writeHead(200,{'content-type':'application/javascript'});res.end(js);return;}
 if(req.url==='/board.css'){res.writeHead(200,{'content-type':'text/css'});res.end(css);return;}
 if(req.url==='/health'){res.writeHead(200,{'content-type':'application/json','x-ship-release':String(release)});res.end(JSON.stringify({ok:true,service:'harbor-live',release}));return;}
 if(req.url==='/events'){
  res.writeHead(200,{'content-type':'text/event-stream','cache-control':'no-cache, no-transform','x-accel-buffering':'no','x-ship-release':String(release)});
  for(const shipment of shipments){res.write('data: '+JSON.stringify(shipment)+'\n\n');await new Promise(resolve=>setTimeout(resolve,700));}
  res.end();return;
 }
 if(req.url==='/stream'){
  res.writeHead(200,{'content-type':'application/x-ndjson','cache-control':'no-store','x-ship-release':String(release)});
  for(const shipment of shipments){res.write(JSON.stringify(shipment)+'\n');await new Promise(resolve=>setTimeout(resolve,700));}
  res.end();return;
 }
 res.writeHead(404,{'content-type':'application/json'});res.end(JSON.stringify({error:'not found'}));
}).listen(Number(process.env.PORT||3200),'0.0.0.0');
