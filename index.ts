import { httpServer } from './src/http_server/index.js';
import { WebSocketServer } from 'ws';
import {v4 as uuid} from 'uuid';

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const wss = new WebSocketServer({ port: 3000 });

wss.on('connection', (ws)=>{
  const id: string = uuid();
  console.log(`New WS client ${id}`);
  ws.on('message', (message: string)=>{
    ws.send(JSON.stringify(message));
  });
});
