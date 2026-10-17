'use strict';
const http = require('http');
const { WebSocketServer, WebSocket } = require('ws');
const PORT = Number(process.env.PORT || 8080);
const MAX_MESSAGE = 64 * 1024;
const rooms = new Map();
const server = http.createServer((req,res)=>{res.writeHead(200,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify({service:'kamera-izleme-signaling',status:'ok'}));});
const wss = new WebSocketServer({server,maxPayload:MAX_MESSAGE,perMessageDeflate:false});
function send(ws,data){if(ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify(data));}
function validRoom(v){return typeof v==='string'&&/^[a-f0-9]{48}$/.test(v)}
function cleanup(ws){const r=ws.roomId;if(!r)return;const room=rooms.get(r);if(!room)return;room.delete(ws.role);for(const peer of room.values())send(peer,{type:'peer-left'});if(room.size===0)rooms.delete(r);ws.roomId=null;ws.role=null;}
wss.on('connection',(ws,req)=>{ws.isAlive=true;ws.on('pong',()=>ws.isAlive=true);ws.on('message',(raw)=>{let m;try{m=JSON.parse(raw.toString())}catch{return send(ws,{type:'error',message:'Geçersiz mesaj biçimi.'})}if(!m||typeof m.type!=='string')return;
 if(m.type==='join'){if(ws.roomId)return send(ws,{type:'error',message:'Bu bağlantı zaten bir odaya katılmış.'});if(!validRoom(m.room)||!['owner','sharer'].includes(m.role))return send(ws,{type:'error',message:'Davet bağlantısı geçersiz.'});let room=rooms.get(m.room);if(!room){room=new Map();rooms.set(m.room,room)}if(room.has(m.role))return send(ws,{type:'error',message:'Bu rolde başka bir cihaz zaten bağlı.'});if(room.size>=2)return send(ws,{type:'error',message:'Bu davet zaten kullanımda.'});ws.roomId=m.room;ws.role=m.role;room.set(m.role,ws);send(ws,{type:'joined'});if(room.size===2){for(const peer of room.values())send(peer,{type:'ready'})}return;}
 if(!ws.roomId||!['offer','answer','candidate','leave'].includes(m.type))return;
 if(m.type==='offer'&&ws.role!=='sharer')return send(ws,{type:'error',message:'Yalnızca paylaşımı başlatan cihaz teklif gönderebilir.'});
 if(m.type==='answer'&&ws.role!=='owner')return send(ws,{type:'error',message:'Yalnızca bağlantı sahibi yanıt gönderebilir.'});
 if(m.type==='offer'||m.type==='answer'){if(typeof m.sdp!=='string'||m.sdp.length>50000)return send(ws,{type:'error',message:'SDP geçersiz.'})}
 if(m.type==='candidate'&&(!m.candidate||typeof m.candidate.candidate!=='string'||m.candidate.candidate.length>4096))return;
 const room=rooms.get(ws.roomId);if(!room)return;for(const [role,peer] of room)if(peer!==ws)send(peer,m);
 if(m.type==='leave')cleanup(ws);
 });ws.on('close',()=>cleanup(ws));ws.on('error',()=>cleanup(ws));});
const heartbeat=setInterval(()=>{for(const ws of wss.clients){if(!ws.isAlive){ws.terminate();continue}ws.isAlive=false;ws.ping()}},30000);wss.on('close',()=>clearInterval(heartbeat));
server.listen(PORT,'0.0.0.0',()=>console.log(`Kamera İzleme signaling server listening on ${PORT}`));
