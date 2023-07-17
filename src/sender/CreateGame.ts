import { wsclients } from '../..';
import { addIndex, roomUsers } from '../data';
import { CustomWebSocket, Request } from '../types';
import { getPlayerNameByIndex } from '../utils';
import { updateRooms } from './updater';

export const createGame = (ws: CustomWebSocket, idGame: number, receivedMessage: Request) => {
    const { indexRoom } = JSON.parse(receivedMessage.data);    
    const roomIndex = roomUsers.findIndex((room) => room.roomId === indexRoom);

    if (roomIndex !== -1) {
        const name = getPlayerNameByIndex(ws.index);
        const creatorIndex = roomUsers[roomIndex].roomUsers[0].index; 
        if (ws.index !== creatorIndex) {
            const player = {
            name: name,
            index: ws.index,
        };
            if (roomUsers[roomIndex].roomUsers.length < 2) {
                roomUsers[roomIndex].roomUsers.push(player);
                console.log(`Player ${name} added to room ${indexRoom}`);

                const roomPlayerIndexes = roomUsers[roomIndex].roomUsers.map((user) => user.index);
                roomUsers.splice(roomIndex, 1);
                updateRooms();
                const filteredClients = wsclients.filter((client) => roomPlayerIndexes.includes(client.index));
                filteredClients.forEach((client) => {
                        addIndex(idGame, client.index, client.index);
                        const updatedMessage: Request = {
                            type: 'create_game',
                            data: JSON.stringify({
                            idGame: idGame,
                            idPlayer: client.index,
                            }),
                            id: 0,
                        };
                        client.send(JSON.stringify(updatedMessage));
                    });
                    console.log(`Room ${indexRoom} create game`);
            } else {
                console.log('The room is already full. Cannot add more players.');
            }
        } else {
            console.log('The creator of the room cannot join it.');
        }
    } else {
        console.log(`Room ${indexRoom} not found`);
    }
  };