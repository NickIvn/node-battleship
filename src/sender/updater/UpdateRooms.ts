import { wsclients } from '../../..';
import { roomUsers } from '../../data';
import { sendToAllClients } from '../../utils';

export const updateRooms = () => {
    const creator = roomUsers.filter((room) => room.roomUsers.length === 1);

    const update = JSON.stringify(creator);

    const response = {
        type: 'update_room',
        data: update,
        id: 0,
    };

    sendToAllClients(response, wsclients);
};