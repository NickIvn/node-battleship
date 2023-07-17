import { indexes } from '../data';

export function getGameIdByPlayerIndex(indexPlayer: string): number | undefined {
    const data = indexes.find((user) => user.idPlayer === indexPlayer);

    if (!data) {
      return undefined;
    }

    return data.idGame;
  }