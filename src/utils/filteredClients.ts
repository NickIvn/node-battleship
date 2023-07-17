import { wsclients } from '../..';
import { indexes } from '../data';
import { CustomWebSocket } from '../types';

export function filterClientsByIndex(gameId: number): CustomWebSocket[] {
    return wsclients.filter((client) => {
      const playerIndex = indexes.find((user) => user.idGame === gameId && user.index === client.index);
      return playerIndex !== undefined;
    });
  }