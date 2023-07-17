import { nextPlayer } from '../../..';
import { checkAttack, killedList, placeShip } from '../../data';
import { IKilled, INextPlayer, Request } from '../../types';
import { findUpdatedIndexPlayer } from '../../utils';

export const addMatrix = (receivedMessage: Request) => {
    try {
        const { gameId, ships, indexPlayer } = JSON.parse(receivedMessage.data);
        const updatedIndexPlayer = findUpdatedIndexPlayer(gameId, indexPlayer);
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