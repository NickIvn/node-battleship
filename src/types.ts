import { WebSocket } from 'ws';

export interface Request {
    type: string;
    data: string;
    id: number;
  }

  export interface CustomWebSocket extends WebSocket {
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
}