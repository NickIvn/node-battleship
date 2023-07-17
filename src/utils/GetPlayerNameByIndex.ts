import { players } from '../data';

export const getPlayerNameByIndex = (index: string): string => {
    const player = players.find((player) => player.index === index);
    if (player) {
      return player.name;
    } else {
      throw new Error(`Player not found with index ${index}`);
    }
  };