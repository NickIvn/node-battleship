import { CustomWebSocket, Request } from '../types';
import { placeShip, registerPlayer, resetRoomUsers, gameSession, roomRegister, roomUsers } from '../data/index';
import { players } from '../data/index';
import { wsclients } from '../../index';

export const sendToAllClients = (message: Request, wsclients:CustomWebSocket[]) =>{
    wsclients.forEach((client) => {
        client.send(JSON.stringify(message));
    });
};

const getPlayerNameByIndex = (index: string): string => {
  const player = players.find((player) => player.index === index);
  if (player) {
    return player.name;
  } else {
    throw new Error(`Player not found with index ${index}`);
  }
};

export const userRegistration = (receivedMessage: Request, ws:CustomWebSocket) => {
    const {name, password} = JSON.parse(receivedMessage.data);
    const existingPlayer = players.find((player) => player.name === name);
    if (existingPlayer){
        const updatedMessage : Request = {
            type: 'reg',
            data: JSON.stringify({
                name,
                index: ws.index,
                error: true,
                errorText: 'Player already exists',
            }),
            id: 0,
        };

        ws.send(JSON.stringify(updatedMessage));
    } else {
        const updatedMessage : Request = {
            type: 'reg',
            data: JSON.stringify({
                name,
                index: ws.index,
                error: false,
                errorText: '',
            }),
            id: 0,
        };
        ws.send(JSON.stringify(updatedMessage));
        registerPlayer(name, password, ws.index);
    }
};

export const updateRoom = (ws:CustomWebSocket) => {
  if (roomUsers.length === 0) {
      const name = getPlayerNameByIndex(ws.index);
      roomRegister(name, ws.index);
      const rooms = JSON.stringify([{
          roomId: ws.index,
          roomUsers: roomUsers,
      }]);

      const updatedMessage : Request = {
          type: 'update_room',
          data: rooms,
          id: 0,
      };
      sendToAllClients(updatedMessage, wsclients);
  }
};

export const createGame = (ws:CustomWebSocket, idGame: number ) => {
  let playerId = 0;
    if (roomUsers.length === 1) {
        const name = getPlayerNameByIndex(ws.index);
        const isIndexRegistered = roomUsers.some((user) => user.index === ws.index);
        if (!isIndexRegistered) {
            roomRegister(name, ws.index);
            const filteredClients = wsclients.filter((client) => roomUsers.some((user) => user.index === client.index));
            filteredClients.forEach((client) => {
            playerId++;
            const updatedMessage: Request = {
                type: 'create_game',
                data: JSON.stringify({
                idGame: idGame,
                idPlayer: playerId,
                }),
                id: 0,
            };
            client.send(JSON.stringify(updatedMessage));
            resetRoomUsers();
            });
        }
      }
};



export const startGame = (ws: CustomWebSocket, receivedMessage: Request) => {

    const {gameId, ships} = JSON.parse(receivedMessage.data);
    const updatedMessage : Request = {
        type: 'start_game',
        data: JSON.stringify({
          ships,
          currentPlayerIndex: ws.index,
        }),
        id: 0,
    };
    ws.send(JSON.stringify(updatedMessage));
    placeShip(gameId, ws.index, ships);
    console.log(gameSession);
};

export const userAttack = (ws: CustomWebSocket, receivedMessage: Request) => {
  const { x, y } = JSON.parse(receivedMessage.data);
  const updatedMessage: Request = {
      type: 'attack',
      data: JSON.stringify({
          position: {
              x: x,
              y: y,
          },
          currentPlayes: ws.index,
          status: 'miss'||'killed'||'shot',
      }),
        id: 0,
    };
    ws.send(JSON.stringify(updatedMessage));
};

export const turnUser = (ws: CustomWebSocket) => {
    const updatedMessage: Request = {
        type: 'turn',
        data: JSON.stringify({
            currentPlayer: ws.index
        }),
        id:0,
    };
    ws.send(JSON.stringify(updatedMessage));
};