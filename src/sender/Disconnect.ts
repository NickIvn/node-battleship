import { removePlayerById } from '../..';
import { indexes, removeGameSessionByGameId, removeIndexByGameId, removeKilledDataByIdPlayer } from '../data';
import { CustomWebSocket, IIndex, Request } from '../types';
import { filterClientsByIndex } from '../utils';

export const finishGame = (ws:CustomWebSocket) => {
    const data = indexes.find((user) => user.idPlayer === ws.index);
    if (!data) {
        return;
    }
    const gameId = data.idGame;
    const filteredClients = filterClientsByIndex(gameId);
    const updatedIndexPlayer = indexes.find((data: IIndex) => data.idGame === gameId && data.idPlayer !== ws.index);
    filteredClients.forEach((client) => {
        removePlayerById(gameId);
        removeKilledDataByIdPlayer(client.index);
        removeGameSessionByGameId(gameId);
        removeIndexByGameId(gameId);
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