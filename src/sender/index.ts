import { CustomWebSocket, IIndex, Request } from '../types';
import { placeShip, registerPlayer, addIndex, indexes, roomUsers, firstPlayerMessage, resetFirstPlayer } from '../data/index';
import {getValueByXY} from '../game/index';
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
        console.log(`Client ${ws.index} register: player name - ${name}`);
    }
};

export const updateRoom = (ws: CustomWebSocket, roomId: number) => {
  const name = getPlayerNameByIndex(ws.index);  
  const existingRoomIndex = roomUsers.findIndex((room) => room.roomUsers.some((user) => user.index === ws.index));

  if (existingRoomIndex !== -1) {
    roomUsers.splice(existingRoomIndex, 1);
    console.log(`Room with user index ${ws.index} already exists. Deleting the room.`);
    console.log(roomUsers);
  }

  const rooms = {
    roomId: roomId,
    roomUsers: [
      {
        name: name,
        index: ws.index,
      },
    ],
  };
  roomUsers.push(rooms);

  const updatedMessage = {
    type: 'update_room',
    data: JSON.stringify(roomUsers),
    id: 0,
  };
  sendToAllClients(updatedMessage, wsclients);
  console.log(`Create room N${roomId}`);
  console.log(roomUsers);
};

export const createGame = (ws: CustomWebSocket, idGame: number, receivedMessage: Request) => {
  const { indexRoom } = JSON.parse(receivedMessage.data);    
  // Поиск комнаты по roomId
  const roomIndex = roomUsers.findIndex((room) => room.roomId === indexRoom);
  
  // Если комната существует, добавить игрока в комнату
  if (roomIndex !== -1) {
      const name = getPlayerNameByIndex(ws.index);
      const creatorIndex = roomUsers[roomIndex].roomUsers[0].index; // Индекс создателя комнаты
    
    // Проверка, что игрок не является создателем комнаты
      if (ws.index !== creatorIndex) {
          const player = {
          name: name,
          index: ws.index,
      };
      
      // Проверка на максимальное количество игроков в комнате (не более 2 игроков)
          if (roomUsers[roomIndex].roomUsers.length < 2) {
              roomUsers[roomIndex].roomUsers.push(player);
              console.log(roomUsers);
              console.log(`Player ${name} added to room ${indexRoom}`);
              
              // Извлечение всех индексов игроков комнаты из wsclients
              const roomPlayerIndexes = roomUsers[roomIndex].roomUsers.map((user) => user.index);
              roomUsers.splice(roomIndex, 1);
              console.log(roomUsers);
              
              // Фильтрация wsclients, чтобы оставить только клиентов с индексами игроков комнаты
              const filteredClients = wsclients.filter((client) => roomPlayerIndexes.includes(client.index));
              filteredClients.forEach((client) => {
                      addIndex(idGame, client.index, client.index); 
                      const updatedMessage: Request = {
                          type: 'create_game',
                          data: JSON.stringify({
                          idGame: idGame,
                          idPlayer: client.index,
                          }),
                          id: 0,
                      };
                      client.send(JSON.stringify(updatedMessage));
                  });
                  console.log(`Room ${indexRoom} removed`);
          } else {
              console.log('The room is already full. Cannot add more players.');
          }
      } else {
          console.log('The creator of the room cannot join it.');
      }
  } else {
      console.log(`Room ${indexRoom} not found`);
  }
};

export const addMatrix = (receivedMessage: Request) => {
  try {
      const { gameId, ships, indexPlayer } = JSON.parse(receivedMessage.data);
      const updatedIndexPlayer = indexes.find((data: IIndex) => data.idGame === gameId && data.idPlayer !== indexPlayer);
      if (updatedIndexPlayer) {
          placeShip(gameId, updatedIndexPlayer.idPlayer, ships);
      } else {
          console.error('Could not find updatedIndexPlayer');
      }
  } catch (error) {
      console.error('Error occurred in startGame:', error);
  }
};


export const startGame = (ws: CustomWebSocket, receivedMessage: Request) => {
  const { ships, indexPlayer } = JSON.parse(receivedMessage.data);

  if (firstPlayerMessage.length === 0) {
      firstPlayerMessage.push(receivedMessage);
      console.log(ws.index);
      console.log(firstPlayerMessage);
      console.log(JSON.parse(firstPlayerMessage[0].data).indexPlayer);
  } else {
      console.log(ws.index);
      const filteredClient = wsclients.find((client) => client.index === JSON.parse(firstPlayerMessage[0].data).indexPlayer);
      if (filteredClient) {
          const updatedMessage: Request = {
              type: 'start_game',
              data: JSON.stringify({
                  ships: JSON.parse(firstPlayerMessage[0].data).ships,
                  currentPlayerIndex: JSON.parse(firstPlayerMessage[0].data).indexPlayer,
              }),
              id: 0,
          };
          console.log(filteredClient.index);
          filteredClient.send(JSON.stringify(updatedMessage));
          const firstPlayerMessageToSend: Request = {
              type: 'start_game',
              data: JSON.stringify({
                  ships,
                  currentPlayerIndex: indexPlayer,
              }),
              id: 0,
          };
          ws.send(JSON.stringify(firstPlayerMessageToSend));
          console.log(firstPlayerMessageToSend);
          console.log(indexPlayer);
          resetFirstPlayer();
        } else {
          console.log('Клиент с указанным индексом не найден.');
        }
  }
};




export const userAttack = (receivedMessage: Request) => {
  const { gameId, x, y, indexPlayer } = JSON.parse(receivedMessage.data);

  const status = getValueByXY(gameId, indexPlayer, x, y);
  // turnUser(receivedMessage, status);
  const filteredClients = wsclients.filter((client) => {
      const playerIndex = indexes.find((user) => user.idGame === gameId && user.index === client.index);
      return playerIndex !== undefined;
  });
  filteredClients.forEach((client) => {
      const updatedMessage: Request = {
          type: 'attack',
          data: JSON.stringify({
              position: {
                  x: x,
                  y: y,
              },
              currentPlayer: indexPlayer,
              status: status,
          }),
          id: 0,
      };
      client.send(JSON.stringify(updatedMessage));
  });
};

export const attackPlayer = (x: number, y: number, indexPlayer: string, status: string) => {
  const data = indexes.find((user) => user.idPlayer === indexPlayer);
  if (!data) {
      return;
  }
  const gameId = data.idGame;

  const filteredClients = wsclients.filter((client) => {
      const playerIndex = indexes.find((user) => user.idGame === gameId && user.index === client.index);
      return playerIndex !== undefined;
  });
  filteredClients.forEach((client) => {
      const updatedMessage: Request = {
          type: 'attack',
          data: JSON.stringify({
              position: {
                  x: x,
                  y: y,
              },
              currentPlayer: indexPlayer,
              status: status,
          }),
          id: 0,
      };
      client.send(JSON.stringify(updatedMessage));
  });};



export const turnUser = (receivedMessage:Request, status = 'start') => {
  const {indexPlayer } = JSON.parse(receivedMessage.data);
  const data = indexes.find((user) => user.idPlayer === indexPlayer);
  if (!data) {
      return;
  }
  const gameId = data.idGame;
  const indexesByGameId = indexes.filter((item) => item.idGame === gameId);
  const gamePlayers = indexesByGameId.map((item) => item.idPlayer);
  let randomPlayer:any;
  if (status === 'miss' || status === 'killed'){
      randomPlayer = indexPlayer;
      console.log(status);
  } else {
      const randomIndex = Math.floor(Math.random() * gamePlayers.length);
      randomPlayer = gamePlayers[randomIndex];
      console.log(randomPlayer);
      console.log('other');
      return randomPlayer;
  }
  const dataIndex = indexes.find((user) => user.idPlayer === randomPlayer);
  if (!dataIndex) {
    return;
  }
  const randomPlayerIndex = dataIndex.index;
  

  const filteredClients = wsclients.filter((client) => {
      const playerIndex = indexes.find((user) => user.idGame === gameId && user.index === client.index);
      return playerIndex !== undefined;
  });

  filteredClients.forEach((client) => {
      if (client.index === randomPlayerIndex) {
          const updatedMessage: Request = {
              type: 'turn',
              data: JSON.stringify({
                  currentPlayer: randomPlayer,
              }),
              id: 0,
          };
          client.send(JSON.stringify(updatedMessage));
      }
  });
};