import { httpServer } from './src/http_server/index.js';
import { WebSocketServer } from 'ws';
import {v4 as uuid} from 'uuid';
import { CustomWebSocket, Request } from './src/types';
import { userRegistration, createGame  } from './src/sender/index';

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const wss = new WebSocketServer({ port: 3000 });

wss.on('connection', (ws: CustomWebSocket)=>{
  const id: string = uuid();
  ws.index = id;
  console.log(`New WS client ${id}`);
  ws.on('message', (message: string)=>{
    const receivedMessage = JSON.parse(message);
    const {type, data, id}:Request = receivedMessage;
    switch (type){
      case 'reg':
        userRegistration(receivedMessage, ws);
        break;
      case 'create_room':
        createGame(ws);
        break;
      default:
         console.log(`Uknown message type ${type}`);
        break;
    }
  });
});
