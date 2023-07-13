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
  indexPlayer:string;
  gameBoard:Ship[]; 
}

export interface IPlayer  {
  name: string;
  index: string;
}

export interface IRoomUsers {
  roomId: number;
  roomUsers: IPlayer[];
}


export interface IIndex {
  idGame: number;
  idPlayer: string;
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
