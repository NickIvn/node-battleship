import { WebSocket } from 'ws';

export interface Request {
    type: string;
    data: string;
    id: number;
  }

  export interface CustomWebSocket extends WebSocket {
    index: string;
}

export interface IGameSession {
  gameId:number;
  indexPlayer:number;
  gameBoard:Ship[]; 
}

export interface IRoomUsers {
  name: string;
  index: string;
}

export interface IIndex {
  playerId: number;
  index: string;
}

export interface Ship {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  type: string;
  length: number;
  [index: number]: string;
}
