import { wsclients } from '../../..';
import { players } from '../../data';
import { sendToAllClients } from '../../utils';

export const updateWinners = () => {
  const transformedPlayers = players
  .filter((player) => player.wins > 0)
  .map((player) => {
    return {
      name: player.name,
      wins: player.wins,
    };
  });
    if (transformedPlayers.length === 0) return;
    const response = {
        type: 'update_winners',
        data: JSON.stringify(transformedPlayers),
        id: 0,
      };
      sendToAllClients(response, wsclients);
};