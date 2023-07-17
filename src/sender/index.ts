import { CustomWebSocket, IIndex, Request, IKilled, INextPlayer } from '../types';
import { placeShip, registerPlayer, addIndex, addLastToList, checkAttack, indexes, roomUsers, firstPlayerMessage, resetFirstPlayer, killedList, updatePlayerWins  } from '../data/index';
import {getValueByXY} from '../game/index';
import { players } from '../data/index';
import { wsclients, nextPlayer } from '../../index';


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

function hasWhitespace(str: string): boolean {
  return /\s/.test(str);
}


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

        // const updatedMessage : Request = {
        //     type: 'reg',
        //     data: JSON.stringify({
        //         name,
        //         index: ws.index,
        //         error: false,
        //         errorText: '',
        //     }),
        //     id: 0,
        // };
        // ws.send(JSON.stringify(updatedMessage));
        // registerPlayer(name, password, ws.index);
        // console.log(`Client ${ws.index} register: player name - ${name}`);
        // updateRooms();
        // updateWinners();
        if (!hasWhitespace(name)){
          if (!hasWhitespace(password)){
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
              updateRooms();
              updateWinners();
          } 
          else {
              const updatedMessage : Request = {
                  type: 'reg',
                  data: JSON.stringify({
                      name,
                      index: ws.index,
                      error: true,
                      errorText: 'Please check password',
                  }),
                  id: 0,
              };

              ws.send(JSON.stringify(updatedMessage));
          }

      }
      else {
          const updatedMessage : Request = {
              type: 'reg',
              data: JSON.stringify({
                  name,
                  index: ws.index,
                  error: true,
                  errorText: 'Please type name',
              }),
              id: 0,
          };

          ws.send(JSON.stringify(updatedMessage));
      }
    }
};

export const updateRoom = (ws: CustomWebSocket, roomId: number) => {
  const name = getPlayerNameByIndex(ws.index);  
  const existingRoomIndex = roomUsers.findIndex((room) => room.roomUsers.some((user) => user.index === ws.index));

  if (existingRoomIndex !== -1) {
    roomUsers.splice(existingRoomIndex, 1);
    console.log(`Room with user index ${ws.index} already exists. Deleting the room.`);
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
  updateRooms();
};

export const updateRooms = () => {
  const creator = roomUsers.filter((room) => room.roomUsers.length === 1);

  const update = JSON.stringify(creator);

  const response = {
      type: 'update_room',
      data: update,
      id: 0,
  };

  sendToAllClients(response, wsclients);
};

export const updateWinners = () => {
  const transformedPlayers = players.map((player) => {
      return {
        name: player.name,
        wins: player.wins,
      };
    });
  if (transformedPlayers.length === 0) return;
  const response = {
      type: 'update_winners',
      data: JSON.stringify(transformedPlayers),
      id: 0,
    };
    sendToAllClients(response, wsclients);
};

export const createGame = (ws: CustomWebSocket, idGame: number, receivedMessage: Request) => {
  const { indexRoom } = JSON.parse(receivedMessage.data);    
  const roomIndex = roomUsers.findIndex((room) => room.roomId === indexRoom);
  
  if (roomIndex !== -1) {
      const name = getPlayerNameByIndex(ws.index);
    
    const creatorIndex = roomUsers[roomIndex].roomUsers[0].index; 
      if (ws.index !== creatorIndex) {
          const player = {
          name: name,
          index: ws.index,
      };
      
          if (roomUsers[roomIndex].roomUsers.length < 2) {
              roomUsers[roomIndex].roomUsers.push(player);
              console.log(roomUsers);
              console.log(`Player ${name} added to room ${indexRoom}`);
              
              const roomPlayerIndexes = roomUsers[roomIndex].roomUsers.map((user) => user.index);
              roomUsers.splice(roomIndex, 1);
              updateRooms();
              // console.log(roomUsers);
              
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
                  console.log(`Room ${indexRoom} create game`);
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
        const player: IKilled = {idPlayer: updatedIndexPlayer.idPlayer, ships:[]};
        killedList.push(player);
        const lastStep: INextPlayer = {idGame: gameId, lastSteps:[]};
            nextPlayer.push(lastStep);
            killedList.push(player);
          placeShip(gameId, updatedIndexPlayer.idPlayer, ships);
          checkAttack(gameId, updatedIndexPlayer.idPlayer, ships);
      } else {
          console.error('Could not find updatedIndexPlayer');
      }
  } catch (error) {
      console.error('Error occurred in startGame:', error);
  }
};


export const startGame = (ws: CustomWebSocket, receivedMessage: Request) => {
  const { ships, indexPlayer } = JSON.parse(receivedMessage.data);
  const status = 'miss';
  if (firstPlayerMessage.length === 0) {
      firstPlayerMessage.push(receivedMessage);
  } else {
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
          turnUser(receivedMessage, status);
          resetFirstPlayer();
        } else {
          console.log('Client has not found');
        }
  }
};

export const userAttack = (receivedMessage: Request) => {
  const { gameId, x, y, indexPlayer } = JSON.parse(receivedMessage.data);

      const checkLastStep = (idGame: number) => {
        const player = nextPlayer.find((player) => player.idGame === idGame);
        if (player && player.lastSteps.length > 0) {
          const lastStep = player.lastSteps[player.lastSteps.length - 1];
          return lastStep;
        } else {
          console.log(`No last step found for game ${idGame}`);
        }
      };
    if (indexPlayer===checkLastStep(gameId)) {
        const status = getValueByXY(gameId, indexPlayer, x, y, 'attack');
        turnUser(receivedMessage, status);
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
        const player = killedList.find((player) => player.idPlayer === indexPlayer);

          if (player) {
            if (player.ships.length === 10) {
            console.log('Game Over');
            filteredClients.forEach((client) => {
              const updatedMessage: Request = {
                  type: 'finish',
                  data: JSON.stringify({
                      winPlayer: indexPlayer,
                  }),
                  id: 0,
              };
              client.send(JSON.stringify(updatedMessage));
          });
          const name = getPlayerNameByIndex(indexPlayer);  
          updatePlayerWins(name, players);
          const transformedPlayers = players.map((player) => {
              return {
                name: player.name,
                wins: player.wins,
              };
            });
          filteredClients.forEach((client) => {
              const updatedMessage: Request = {
                  type: 'update_winners',
                  data: JSON.stringify(transformedPlayers),
                  id: 0,
              };
              client.send(JSON.stringify(updatedMessage));
          });
        }
      } 
    }
};

export const randomAttack = (receivedMessage: Request) => {
  const { gameId, indexPlayer } = JSON.parse(receivedMessage.data);

  const checkLastStep = (idGame: number) => {
      const player = nextPlayer.find((player) => player.idGame === idGame);
      if (player && player.lastSteps.length > 0) {
        const lastStep = player.lastSteps[player.lastSteps.length - 1];
        return lastStep;
      } else {
        console.log(`No last step found for game ${idGame}`);
      }
    };
  const x =  Math.floor(Math.random() * 10);
  const y =  Math.floor(Math.random() * 10);
  if (indexPlayer===checkLastStep(gameId)) {
      const status = getValueByXY(gameId, indexPlayer, x, y, 'attack');
      turnUser(receivedMessage, status);
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
      const player = killedList.find((player) => player.idPlayer === indexPlayer);
      if (player) {
        if (player.ships.length === 10) {
          console.log('Game Over');
          filteredClients.forEach((client) => {
              const updatedMessage: Request = {
                  type: 'finish',
                  data: JSON.stringify({
                      winPlayer: indexPlayer,
                  }),
                  id: 0,
              };
              client.send(JSON.stringify(updatedMessage));
          });
          const name = getPlayerNameByIndex(indexPlayer);  
          updatePlayerWins(name, players);
          const transformedPlayers = players.map((player) => {
              return {
                name: player.name,
                wins: player.wins,
              };
            });
          filteredClients.forEach((client) => {
              const updatedMessage: Request = {
                  type: 'update_winners',
                  data: JSON.stringify(transformedPlayers),
                  id: 0,
              };
              client.send(JSON.stringify(updatedMessage));
          });
        }
      } 
  }
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
    });
};



export const turnUser = (receivedMessage:Request, status: string|undefined) => {
  const {indexPlayer } = JSON.parse(receivedMessage.data);
  const data = indexes.find((user) => user.idPlayer === indexPlayer);
  if (!data) {
      return;
  }
  const gameId = data.idGame;
  const anotherPlayer = indexes.find((user) => user.idGame === gameId && user.index !== indexPlayer);
  const filteredClients = wsclients.filter((client) => {
      const playerIndex = indexes.find((user) => user.idGame === gameId && user.index === client.index);
      return playerIndex !== undefined;
  });

  const currentPlayer = (status === 'miss' || status === 'killed') ? (anotherPlayer?.idPlayer || '') : data.idPlayer;

  filteredClients.forEach((client) => {
          const updatedMessage: Request = {
              type: 'turn',
              data: JSON.stringify({
                  currentPlayer: currentPlayer,
              }),
              id: 0,
          };
          console.log(client.index);
          client.send(JSON.stringify(updatedMessage));
   });
   addLastToList(gameId, currentPlayer);
  return currentPlayer;
};

export const playWithBot = (receivedMessage: Request, ws:CustomWebSocket) => {
  const updatedMessage = {
      type: 'add',
      data:'',
      id: 0,
    };
  ws.send(JSON.stringify(updatedMessage));
};

export const finishGame = (ws:CustomWebSocket) => {
  const data = indexes.find((user) => user.idPlayer === ws.index);
  if (!data) {
      return;
  }
  const gameId = data.idGame;
  const filteredClients = wsclients.filter((client) => {
      const playerIndex = indexes.find((user) => user.idGame === gameId && user.index === client.index);
      return playerIndex !== undefined;
  });
  const updatedIndexPlayer = indexes.find((data: IIndex) => data.idGame === gameId && data.idPlayer !== ws.index);
  filteredClients.forEach((client) => {
      if(updatedIndexPlayer){
          const updatedMessage : Request = {
              type: 'disconnect',
              data: '',
              id: 0,
            };
          client.send(JSON.stringify(updatedMessage));
      }
  });
  filteredClients.forEach((client) => {
      if(updatedIndexPlayer){
      const updatedMessage: Request = {
          type: 'finish',
          data: JSON.stringify({
              winPlayer: client.index,
          }),
          id: 0,
      };
      client.send(JSON.stringify(updatedMessage));
  }
  });
};