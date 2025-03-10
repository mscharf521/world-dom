const { getUsersInRoom } = require('./gameData.js');
const { broadcastToRoom } = require('./send.js');

async function SendUpToDateUserData(roomId, connectionId, domainName, stage, usersInRoom = null) {
    if(usersInRoom == null)
    {
      usersInRoom = await getUsersInRoom(roomId);
    }
    await broadcastToRoom(
      roomId,
      {
        type: 'room-users',
        data: {
          users: usersInRoom.map(user => ({
            username: user.username,
            connectionId: user.connectionId,
            caps: user.caps,
            spies: user.spies
          }))
        }
      },
      connectionId,
      domainName,
      stage,
      usersInRoom
    )
  }

module.exports = {
    SendUpToDateUserData
};