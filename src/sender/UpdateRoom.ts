import { wsclients } from '../..';
import { roomUsers } from '../data';
import { CustomWebSocket } from '../types';
import { getPlayerNameByIndex, sendToAllClients } from '../utils';
import { updateRooms } from './updater/UpdateRooms';

export const updateRoom = (ws: CustomWebSocket, roomId: number) => {
    const name = getPlayerNameByIndex(ws.index);  
    const existingRoomIndex = roomUsers.findIndex((room) => room.roomUsers.some((user) => user.index === ws.index));

    if (existingRoomIndex !== -1) {
      roomUsers.splice(existingRoomIndex, 1);
      console.log(`Room with user index ${ws.index} already exists. Deleting the room.`);
    }

    const rooms = {
      roomId: roomId,
      roomUsers: [
        {
          name: name,
          index: ws.index,
        },
      ],
    };
    roomUsers.push(rooms);

    const updatedMessage = {
      type: 'update_room',
      data: JSON.stringify(roomUsers),
      id: 0,
    };
    sendToAllClients(updatedMessage, wsclients);

    console.log(`Create room ${roomId}`);
    updateRooms();
  };