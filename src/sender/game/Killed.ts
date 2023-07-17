import { indexes } from '../../data';
import { Request } from '../../types';
import { filterClientsByIndex } from '../../utils';

export const attackPlayer = (x: number, y: number, indexPlayer: string, status: string) => {
    const data = indexes.find((user) => user.idPlayer === indexPlayer);
    if (!data) {
        return;
    }
    const gameId = data.idGame;
    const filteredClients = filterClientsByIndex(gameId);
    filteredClients.forEach((client) => {
        const updatedMessage: Request = {
            type: 'attack',
            data: JSON.stringify({
                position: {
                    x: x,
                    y: y,
                },
                currentPlayer: indexPlayer,
                status: status,
            }),
            id: 0,
        };
        client.send(JSON.stringify(updatedMessage));
    });
};