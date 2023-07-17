import { CustomWebSocket, Request } from '../types';
import { players, registerPlayer } from '../data/index';
import { hasWhitespace } from '../utils';
import { updateRooms } from './updater/UpdateRooms';
import { updateWinners } from './updater';

export const userRegistration = (receivedMessage: Request, ws:CustomWebSocket) => {
    const {name, password} = JSON.parse(receivedMessage.data);
    const existingPlayer = players.find((player) => player.name === name);
    if (existingPlayer){
        const updatedMessage : Request = {
            type: 'reg',
            data: JSON.stringify({
                name,
                index: ws.index,
                error: true,
                errorText: 'Player already exists',
            }),
            id: 0,
        };

        ws.send(JSON.stringify(updatedMessage));
    } else {
        if (!hasWhitespace(name)){
            if (!hasWhitespace(password)){
                const updatedMessage : Request = {
                    type: 'reg',
                    data: JSON.stringify({
                        name,
                        index: ws.index,
                        error: false,
                        errorText: '',
                    }),
                    id: 0,
                };
                ws.send(JSON.stringify(updatedMessage));
                registerPlayer(name, password, ws.index);
                console.log(`Client ${ws.index} register: player name - ${name}`);
                updateRooms();
                updateWinners();
            } 
            else {
                const updatedMessage : Request = {
                    type: 'reg',
                    data: JSON.stringify({
                        name,
                        index: ws.index,
                        error: true,
                        errorText: 'Please check password',
                    }),
                    id: 0,
                };

                ws.send(JSON.stringify(updatedMessage));
            }

        }
        else {
            const updatedMessage : Request = {
                type: 'reg',
                data: JSON.stringify({
                    name,
                    index: ws.index,
                    error: true,
                    errorText: 'Please type name',
                }),
                id: 0,
            };

            ws.send(JSON.stringify(updatedMessage));
        }
    }
};