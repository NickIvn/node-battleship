import { nextPlayer } from '../..';
import { Ship, IGameSession, IIndex, IRoomUsers, Request, IKilled, INextPlayer } from '../types';

class Player {
    name: string;
    password: string;
    index: string;
    wins: number;

    constructor(name: string, password: string, index: string) {
      this.name = name;
      this.password = password;
      this.index = index;
      this.wins = 0;
    }
  }


export const players: Player[] = [];

export const gameSession: IGameSession[] = [];

export const checkSession: IGameSession[] = [];

export const roomUsers: IRoomUsers[] = [];

export const killedList: IKilled [] = [];

export const indexes:IIndex[] = [];

export const firstPlayerMessage: Request[] = [];

export function resetFirstPlayer(): void {
  firstPlayerMessage.length = 0;
}

export function playerExists(name: string): boolean {
    return players.some((player) => player.name === name);
  }

    // export const roomRegister = (roomId: number, roomUsers: IPlayer[]): IRoomUsers => {
    //   const newPlayer: IRoomUsers = { name, ind
    //   roomUsers.push(newPlayer);
  
  //   return newPlayer;
  // };

  export const addIndex = (idGame:number, idPlayer: string, index: string): IIndex => {
    const newPlayer: IIndex = { idGame, idPlayer, index };
    indexes.push(newPlayer);
    return newPlayer;
  };

  
  export function resetRoomUsers(): void {
    roomUsers.length = 0;
  }
  export function removeFirstTwoPlayers(): void {
    roomUsers.splice(0, 2);
  }

export function registerPlayer(name: string, password: string, index: string) {
    if (playerExists(name)) {
      return { index: -1, error: true, errorText: 'Player already exists' };
    }

    const newPlayer = new Player(name, password, index);
    newPlayer.wins = 0; 
    players.push(newPlayer);

    return {
      index,
      error: false,
      errorText: '',
    };
  }

export const ChangeMatrix = (x:number, y:number) => {
  console.log(x,y);
};
export const placeShip = (gameId:number, indexPlayer:string, ships:Ship[]) => {
    const gridSize = 10;
    const gameBoard = new Array(gridSize);

    for (let i = 0; i < gridSize; i++) {
        gameBoard[i] = new Array(gridSize).fill('empty');
}

    ships.forEach((ship: Ship) => {
        const { position, direction, type, length } = ship;
        const { x, y } = position;

        if (direction) {
        for (let i = y; i < y + length; i++) {
            gameBoard[i][x] = type;
            }
        } else {
        for (let i = x; i < x + length; i++) {
            gameBoard[y][i] = type;
            }
        }
    });
    const gameDataStorage = {
        gameId,
        indexPlayer,
        gameBoard,
      };
      gameSession.push(gameDataStorage);
    };

    export const checkAttack = (gameId:number,indexPlayer:string,ships:Ship[]) => {
      const gridSize = 10;
      const gameBoard = new Array(gridSize);
    
      for (let i = 0; i < gridSize; i++) {
          gameBoard[i] = new Array(gridSize).fill('empty');
      }
    
      ships.forEach((ship: Ship) => {
          const { position, direction, type, length } = ship;
          const { x, y } = position;
    
          if (direction) {
          for (let i = y; i < y + length; i++) {
              gameBoard[i][x] = type;
              }
          } else {
          for (let i = x; i < x + length; i++) {
              gameBoard[y][i] = type;
              }
          }
      });
      const gameDataStorage = {
          gameId,
          indexPlayer,
          gameBoard,
        };
        checkSession.push(gameDataStorage);
      };

      export const addShipToPlayer = (idPlayer: string, ship: string) => {
        const player = killedList.find((player) => player.idPlayer === idPlayer);
        if (player) {
          player.ships.push(ship);
        } else {
          const newPlayer: IKilled = { idPlayer, ships: [ship] };
          killedList.push(newPlayer);
        }
      };


      export const addLastToList = (idGame: number, lastStep: string) => {
        const player = nextPlayer.find((player) => player.idGame === idGame);
        if (player) {
          player.lastSteps.push(lastStep);
        } else {
          const newPlayer: INextPlayer = { idGame, lastSteps: [lastStep] };
          nextPlayer.push(newPlayer);
        }
      };
    
      export const updatePlayerWins = (name: string, players: Player[]): void => {
        const player = players.find((player) => player.name === name);
    
        if (player) {
          player.wins++;
        }
      };

      export function removeKilledDataByIdPlayer(idPlayer: string): void {
        const index = killedList.findIndex((killed) => killed.idPlayer === idPlayer);
    
        if (index !== -1) {
          killedList.splice(index, 1);
        }
      }
    
      export function removeGameSessionByGameId(gameId: number): void {
        gameSession.forEach((session, index) => {
          if (session.gameId === gameId) {
            gameSession.splice(index, 1);
          }
        });
      }
    
      export function removeIndexByGameId(idGame: number): void {
        indexes.forEach((index, indexToRemove) => {
          if (index.idGame === idGame) {
            indexes.splice(indexToRemove, 1);
          }
        });
      }
    
      export const removeDuplicatePlayers = () => {
        const uniquePlayers: IKilled[] = [];
        const playerIds: Set<string> = new Set();
    
        killedList.forEach((player) => {
          if (!playerIds.has(player.idPlayer)) {
            playerIds.add(player.idPlayer);
            uniquePlayers.push(player);
          }
        });
    
        killedList.length = 0;
        killedList.push(...uniquePlayers);
      };
    
      export const removeDuplicatePlayersById = () => {
        const uniquePlayers: INextPlayer[] = [];
        const playerIds: Set<number> = new Set();
    
        nextPlayer.forEach((player) => {
          if (!playerIds.has(player.idGame)) {
            playerIds.add(player.idGame);
            uniquePlayers.push(player);
          } else {
            const existingPlayer = uniquePlayers.find((p) => p.idGame === player.idGame);
            if (existingPlayer && existingPlayer.lastSteps.length === 0) {
              existingPlayer.lastSteps = player.lastSteps;
            }
          }
        });
    
        nextPlayer.length = 0;
        nextPlayer.push(...uniquePlayers);
      };
