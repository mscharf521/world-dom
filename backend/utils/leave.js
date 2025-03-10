const { 
    getUserByConnection, 
    removeUserFromRoom, 
    getRoomData, 
    getUsersInRoom, 
    removeRoom 
} = require('../utils/gameData');
const { checkWinCondition } = require('../utils/wincon');
const { SendUpToDateUserData } = require('./sendusers');

async function leaveRoom(connectionId, domainName, stage)
{
    const user = await getUserByConnection(connectionId);

    if(user)
    {
        await removeUserFromRoom(user.room, connectionId);

        const room_data = await getRoomData(user.room);
        let usersInRoom = await getUsersInRoom(user.room);

        if(usersInRoom.length > 0)
        {
            await checkWinCondition(room_data, usersInRoom);

            await SendUpToDateUserData(user.room, connectionId, domainName, stage, usersInRoom);
        }
        else
        {
            await removeRoom(user.room);
        }
    }
}

module.exports = {
    leaveRoom
}