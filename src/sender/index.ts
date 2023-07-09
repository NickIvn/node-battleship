import { Request } from '../types';

export const userRegistration = (receivedMessage: Request) => {
    const {name, password} = JSON.parse(receivedMessage.data);
    const updatedMessage : Request = {
    type: 'reg',
    data: JSON.stringify({
        name,
        index: 1,
        error: false,
        errorText: '',
    }),
    id: 0,
};
    return updatedMessage;
};