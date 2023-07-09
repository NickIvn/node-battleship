import { httpServer } from './src/http_server/index.js';
import { WebSocketServer } from 'ws';
import {v4 as uuid} from 'uuid';
import { Request } from './src/types';
import { userRegistration } from './src/sender/index';

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const wss = new WebSocketServer({ port: 3000 });

wss.on('connection', (ws)=>{
  const id: string = uuid();
  console.log(`New WS client ${id}`);
  ws.on('message', (message: string)=>{
    const receivedMessage = JSON.parse(message);
    const {type, data, id}:Request = receivedMessage;
    switch (type){
      case 'reg':
        userRegistration(receivedMessage);
        break;
      default:
        console.log('Uknown message type');
        break;
    }
    ws.send(JSON.stringify(receivedMessage));
  });
});
