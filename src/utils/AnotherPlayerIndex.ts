import { indexes } from '../data';
import { IIndex } from '../types';

export function findUpdatedIndexPlayer(gameId: number, indexPlayer: string): IIndex | undefined {
    return indexes.find((data: IIndex) => data.idGame === gameId && data.idPlayer !== indexPlayer);
  }