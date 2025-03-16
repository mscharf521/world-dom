const { 
    getUserByConnection, 
    removeUserFromRoom, 
    getRoomData, 
    getUsersInRoom, 
    removeRoom 
} = require('../utils/gameData');
const { checkWinCondition } = require('../utils/wincon');
const { SendUpToDateUserData } = require('./sendusers');
const { broadcastToRoom } = require('./send');
const { PrepUsers } = require('./sendusers');

async function leaveRoom(connectionId, domainName, stage)
{
    const user = await getUserByConnection(connectionId);

    if(user)
    {
        await removeUserFromRoom(user.room, connectionId);

        const room_data = await getRoomData(user.room);
        let usersInRoom = await getUsersInRoom(user.room);

        const itsThisUsersTurn = room_data.turnOrder[room_data.turnIndex] == connectionId;

        if(usersInRoom.length > 0)
        {
            // Filter the player that left just in case to make sure they are
            // removed from the turn order and not sent messages
            await checkWinCondition(room_data, usersInRoom);

            if(itsThisUsersTurn && room_data.turnOrder.length != 0) {
                // Active player left, set next player active
                await broadcastToRoom(
                    user.room,
                    {
                        type: 'next-turn',
                        data: {
                            userID: room_data.turnOrder[room_data.turnIndex],
                            // Pass up to date user data to avoid race conditions in the client
                            users: PrepUsers(usersInRoom)
                        }
                    },
                    connectionId, domainName, stage, usersInRoom
                );
            } else {
                await SendUpToDateUserData(user.room, connectionId, domainName, stage, usersInRoom);
            }
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