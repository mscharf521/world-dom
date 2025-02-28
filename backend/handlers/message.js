const { 
  createRoom,
  getRoomData,
  setRoomGameStarted,
  setRoomTurnOrder,
  addBombToRoom,
  createUser,
  getUsersInRoom,
  getUserByConnection,
  setUserCapitals,
  discoverUserCap,
  incRoomTurnIndex,
  setRoomSettings
} = require('../utils/gameData');
const { checkWinCondition } = require('../utils/wincon');
const { broadcastToRoom, sendToConnection } = require('../utils/send');
const { leaveRoom } = require('../utils/leave');
const { getDistanceFromLatLng } = require('../utils/dst');

exports.handler = async (event) => {
  const { connectionId, domainName, stage } = event.requestContext;
  
  try {
    const payload = JSON.parse(event.body);
    const { action, data } = payload;

    switch (action) {
      case 'req-connection-id': {
        await sendToConnection(
          connectionId, 
          {
            type: 'connection-id',
            data: {
              connectionId: connectionId
            }
          },
          domainName,
          stage
        );
        return { statusCode: 200, body: 'Connection ID sent' };
      }

      case 'join-room': {
        const { roomId, username } = data;
        let success = false;
        let leader = false;
        
        let room_data = await getRoomData(roomId);
        // room does not exist and it has not started playing
        if( room_data != null
         && !room_data.hasStarted )
        {
            success = true;
        }
        // room does not exist
        else if (room_data == null)
        {
            // create room and join as "leader"
            room_data = await createRoom(roomId, "");
            success = true;
            leader = true;
        }

        if(success)
        {
            await createUser(roomId, connectionId, username);
            const usersInRoom = await getUsersInRoom(roomId);
            await broadcastToRoom(
              roomId,
              { 
                type: 'room-users',
                data: {
                  users: usersInRoom.map(user => ({
                    username: user.username,
                    connectionId: user.connectionId,
                    caps: user.caps
                  }))
                }
              },
              connectionId,
              domainName,
              stage
            );
        }
        await sendToConnection(
          connectionId, 
          { 
            type: 'joined-room-result',
            data: {success, leader, settings: room_data.settings}
          }, 
          domainName, 
          stage
        );

        return { statusCode: 200, body: 'Joined room' };
      }

      case 'client-message': {
        const { roomId, message } = data;
        const user = await getUserByConnection(connectionId);
        
        if (!user) {
          return { statusCode: 400, body: 'User not found' };
        }

        await broadcastToRoom(
          roomId,
          {
            type: 'message',
            data: {
              userId: connectionId,
              username: user.username,
              message
            }
          },
          connectionId,
          domainName,
          stage
        );

        return { statusCode: 200, body: 'Message sent' };
      }

      case 'host-start-game': {
        const { room: roomId } = data;
        const usersInRoom = await getUsersInRoom(roomId);
        if(usersInRoom.length > 1)
        {
          //Could verify user is host here
          await setRoomGameStarted(roomId);
          const room_data = await getRoomData(roomId);
          await broadcastToRoom(
            roomId,
            {
              type: 'start-game',
              data: {num_caps: room_data.num_caps}
            },
            connectionId,
            domainName,
            stage,
            usersInRoom
          );
        }
        return { statusCode: 200, body: 'Game started' };
      }

      case 'cap-sel': {
        const { room: roomId, caps } = data;

        await setUserCapitals(roomId, connectionId, caps);
        const usersInRoom = await getUsersInRoom(roomId);

        await broadcastToRoom(
          roomId,
          {
            type: 'room-users',
            data: {
              users: usersInRoom.map(user => ({
                username: user.username,
                connectionId: user.connectionId,
                caps: user.caps
              }))
            }
          },
          connectionId,
          domainName,
          stage,
          usersInRoom
        );

        let done = true;
        for(var user of usersInRoom)
        {
            if(user.caps.length == 0)
            {
                done = false;
                break;
            }
        }

        if(done)
        {
            shuffle(usersInRoom);
            await setRoomTurnOrder(roomId, usersInRoom.map(user => user.connectionId));
            await broadcastToRoom(
              roomId,
              {
                type: 'next-turn',
                data: {userID: usersInRoom[0].connectionId}
              },
              connectionId,
              domainName,
              stage,
              usersInRoom
            );
        }
        return { statusCode: 200, body: 'Capitals selected' };
      }

      case 'client-turn': {
        const { room: roomId, bomb } = data;
        let usersInRoom = await getUsersInRoom(roomId);

        await addBombToRoom(roomId, bomb);
        await incRoomTurnIndex(roomId);

        let room_data = await getRoomData(roomId);

        await broadcastToRoom(
          roomId,
          {
            type: 'bomb-update',
            data: {bombs: room_data.bombs}
          },
          connectionId,
          domainName,
          stage,
          usersInRoom
        );
        
        let cap_hit = false;
        for(var user of usersInRoom)
        {
            for(var cap_index in user.caps)
            {
                const cap = user.caps[cap_index]; 
                if(!cap.discovered)
                {
                    const dst_km = getDistanceFromLatLng(bomb.center.lat, bomb.center.lng, cap.capinfo.lat, cap.capinfo.lng);
                    if(dst_km <= (bomb.radius / 1000.0) )
                    {
                        await discoverUserCap(roomId, user.connectionId, cap_index);
                        cap_hit = true;

                        // Broadcast cap-discover message to the room
                        await broadcastToRoom(
                          roomId,
                          {
                            type: 'cap-discover',
                            data: {
                              capInfo: cap.capinfo
                            }
                          },
                          connectionId,
                          domainName,
                          stage,
                          usersInRoom
                        );
                    }
                }
            }
        }

        if(cap_hit)
        {
          // Get up to date user data
          usersInRoom = await getUsersInRoom(roomId);
          await broadcastToRoom(
            roomId,
            {
              type: 'room-users',
              data: {
                users: usersInRoom.map(user => ({
                  username: user.username,
                  connectionId: user.connectionId,
                  caps: user.caps
                }))
              }
            },
            connectionId,
            domainName,
            stage,
            usersInRoom
          )

          await checkWinCondition(room_data, usersInRoom, domainName, stage);

          // could improve this by not fetching the room data again?
          room_data = await getRoomData(roomId);
        }

        await broadcastToRoom(
          roomId,
          {
            type: 'next-turn',
            data: {userID: room_data.turnOrder[room_data.turnIndex]}
          },
          connectionId,
          domainName,
          stage,
          usersInRoom
        );
        
        return { statusCode: 200, body: 'Bomb set' };
      }

      case 'leave-room': {
        await leaveRoom(connectionId, domainName, stage);
        return { statusCode: 200, body: 'Left room' };
      }

      case 'settings-change': {
        const { room: roomId, settings } = data;
        await setRoomSettings(roomId, settings);
        
        await broadcastToRoom(
          roomId,
          { type: 'settings-change-server', data: { settings } },
          connectionId,
          domainName,
          stage
        );

        return { statusCode: 200, body: 'Settings changed' };
      }

      default:
        return { statusCode: 400, body: 'Unknown action' };
    }
  } catch (err) {
    console.error('Error processing message:', err);
    return { statusCode: 500, body: 'Failed to process message' };
  }
}; 

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}