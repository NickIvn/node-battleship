import { httpServer } from './src/http_server/index';
import { WebSocketServer } from 'ws';
import {v4 as uuid} from 'uuid';
import { CustomWebSocket, Request } from './src/types';
import { userRegistration, updateRoom, createGame, startGame, userAttack, turnUser } from './src/sender/index';

const HTTP_PORT = 8181;
export const wsclients:CustomWebSocket[] = [];

// export const roomUsers = [];

let idGame = 0;
console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const wss = new WebSocketServer({ port: 3000 });

wss.on('connection', (ws:CustomWebSocket)=>{

  const id: string = uuid();
  ws.index = id;
  wsclients.push(ws);
  
  console.log(`New WS client ${id}`);
  const numberOfClients = wss.clients.size;
  console.log(`Numbers of clients: ${numberOfClients} at this moment`);
  ws.on('message', (message: string)=>{
    const receivedMessage = JSON.parse(message);
    const {type}:Request = receivedMessage;
    switch (type){
      case 'reg':
        userRegistration(receivedMessage, ws);
        break;
      case 'create_room':
        updateRoom(ws);
        break;
      case 'add_user_to_room':
        idGame++;
        createGame(ws, idGame);
        break;
      case 'add_ships':
        startGame(ws, receivedMessage);
        turnUser(ws, receivedMessage);
        break;
      case 'attack':
        userAttack(ws, receivedMessage);
        turnUser(ws, receivedMessage);
        break;
      default:
         console.log(`Uknown message type ${type}`);
        break;
    }
  });
  ws.on('close', () => {
    console.log(`Disconnect client ${id}`);
    const numberOfClients = wss.clients.size;
    console.log(`Numbers of clients: ${numberOfClients} at this moment`);
    const index = wsclients.indexOf(ws);
    if (index !== -1) {
      wsclients.splice(index, 1);
    }
  });
});
