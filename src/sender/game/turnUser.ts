import { addLastToList, indexes, removeDuplicatePlayers, removeDuplicatePlayersById } from '../../data';
import { Request } from '../../types';
import { filterClientsByIndex } from '../../utils';

export const turnUser = (receivedMessage: Request, status: string|undefined) => {
    const {indexPlayer } = JSON.parse(receivedMessage.data);
    const data = indexes.find((user) => user.idPlayer === indexPlayer);
    if (!data) {
        return;
    }
    const gameId = data.idGame;

    const anotherPlayer = indexes.find((user) => user.idGame === gameId && user.index !== indexPlayer);
    const filteredClients = filterClientsByIndex(gameId);
    const currentPlayer = (status === 'miss') ? (anotherPlayer?.idPlayer || '') : data.idPlayer;
    filteredClients.forEach((client) => {
            const updatedMessage: Request = {
                type: 'turn',
                data: JSON.stringify({
                    currentPlayer: currentPlayer,
                }),
                id: 0,
            };

            client.send(JSON.stringify(updatedMessage));
    });
    addLastToList(gameId, currentPlayer);
    removeDuplicatePlayers();
    removeDuplicatePlayersById();
    return currentPlayer;
};