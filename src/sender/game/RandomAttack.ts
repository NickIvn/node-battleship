import { nextPlayer } from '../../..';
import { killedList, players, removeDuplicatePlayers, updatePlayerWins } from '../../data';
import { getValueByXY } from '../../game';
import { Request } from '../../types';
import { filterClientsByIndex, getPlayerNameByIndex } from '../../utils';
import { turnUser } from './WhoMove';

export const randomAttack = (receivedMessage: Request) => {
    const { gameId, indexPlayer } = JSON.parse(receivedMessage.data);
    removeDuplicatePlayers();

    const checkLastStep = (idGame: number) => {
        const player = nextPlayer.find((player) => player.idGame === idGame);
        if (player && player.lastSteps.length > 0) {
          const lastStep = player.lastSteps[player.lastSteps.length - 1];
          return lastStep;
        } else {
          console.log(`No last step found for game ${idGame}`);
        }
      };
    const x =  Math.floor(Math.random() * 10);
    const y =  Math.floor(Math.random() * 10);
    if (indexPlayer===checkLastStep(gameId)) {
        const status = getValueByXY(gameId, indexPlayer, x, y, 'attack');
        turnUser(receivedMessage, status);
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
        const player = killedList.find((player) => player.idPlayer === indexPlayer);

        if (player) {
          if (player.ships.length === 10) {
            console.log('Game Over');
            filteredClients.forEach((client) => {
                const updatedMessage: Request = {
                    type: 'finish',
                    data: JSON.stringify({
                        winPlayer: indexPlayer,
                    }),
                    id: 0,
                };
                client.send(JSON.stringify(updatedMessage));
            });
            const name = getPlayerNameByIndex(indexPlayer);  
            updatePlayerWins(name, players);
            const transformedPlayers = players.map((player) => {
                return {
                  name: player.name,
                  wins: player.wins,
                };
              });
            filteredClients.forEach((client) => {
                const updatedMessage: Request = {
                    type: 'update_winners',
                    data: JSON.stringify(transformedPlayers),
                    id: 0,
                };
                client.send(JSON.stringify(updatedMessage));
            });
          }
        } 
    }
};