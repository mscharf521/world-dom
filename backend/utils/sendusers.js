const { getUsersInRoom } = require('./gameData.js');
const { broadcastToRoom } = require('./send.js');

async function SendUpToDateUserData(roomId, connectionId, domainName, stage, usersInRoom = null) {
    if(usersInRoom == null) {
      usersInRoom = await getUsersInRoom(roomId);
    }
    await broadcastToRoom(
      roomId,
      {
        type: 'room-users',
        data: {
          users: PrepUsers(usersInRoom)
        }
      },
      connectionId,
      domainName,
      stage,
      usersInRoom
    )
}

function PrepUsers(usersInRoom) {
  return usersInRoom.map(user => ({
    username: user.username,
    connectionId: user.connectionId,
    caps: user.caps,
    spies: user.spies
  }))
}

module.exports = {
    SendUpToDateUserData,
    PrepUsers
};