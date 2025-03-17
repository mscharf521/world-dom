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
  destroyUserCap,
  destroyUserSpies,
  incRoomTurnIndex,
  setRoomSettings,
  setUserSpies,
  setSpyInfo,
  addScannedByUserSpies,
  addScannedByUserCap,
} = require('../utils/gameData');
const { checkWinCondition } = require('../utils/wincon');
const { broadcastToRoom, sendToConnection } = require('../utils/send');
const { leaveRoom } = require('../utils/leave');
const { SendUpToDateUserData, PrepUsers } = require('../utils/sendusers');

let CONSTANTS = null;
let getDistanceFromLatLng = null;

const startGame = async (roomId, usersInRoom, connectionId, domainName, stage) => {
  let usersInRoomCopy = [...usersInRoom];
  shuffle(usersInRoomCopy);
  await setRoomTurnOrder(roomId, usersInRoomCopy.map(user => user.connectionId));
  await broadcastToRoom(
    roomId,
    {
      type: 'next-turn',
      data: {
        userID: usersInRoomCopy[0].connectionId,
        // Pass up to date user data to avoid race conditions in the client
        users: PrepUsers(usersInRoom)
      }
    }, connectionId, domainName, stage, usersInRoom
  );
};

exports.handler = async (event) => {
  const { connectionId, domainName, stage } = event.requestContext;

  if(!CONSTANTS) CONSTANTS = (await import("@world-dom/common/constants.js")).CONSTANTS;
  if(!getDistanceFromLatLng) getDistanceFromLatLng = (await import("@world-dom/common/dst.js")).getDistanceFromLatLng;
  
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
          await SendUpToDateUserData(roomId, connectionId, domainName, stage);
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
        await SendUpToDateUserData(roomId, connectionId, domainName, stage, usersInRoom);

        const room_data = await getRoomData(roomId);

        // Only check if we need to start the game if we do not have spies
        if(room_data.settings.numberOfSpies <= 0) {
          let done = usersInRoom.reduce((acc, user) => acc && user.caps.length > 0, true);
          if(done)
          {
            await startGame(roomId, usersInRoom, connectionId, domainName, stage);
          }
        }
        return { statusCode: 200, body: 'Capitals selected' };
      }

      case 'spy-sel': {
        const { room: roomId, spies } = data;

        await setUserSpies(roomId, connectionId, spies);

        const usersInRoom = await getUsersInRoom(roomId);
        await SendUpToDateUserData(roomId, connectionId, domainName, stage, usersInRoom);

        let done = usersInRoom.reduce((acc, user) => acc && user.spies.length > 0, true);
        if(done) await startGame(roomId, usersInRoom, connectionId, domainName, stage);

        return { statusCode: 200, body: 'Spies selected' };
      }

      case 'client-spy': {
        const { room: roomId, spyIdx, newSpyInfo } = data;
        let usersInRoom = await getUsersInRoom(roomId);

        const spy_search_radius = CONSTANTS.spy_search_radius;
        const spy_move_scan_max_radius = CONSTANTS.spy_move_scan_max_radius;
        const spy_move_max_radius = CONSTANTS.spy_move_max_radius;

        const act_user = usersInRoom.find(user => user.connectionId === connectionId);
        if (!act_user) {
          return { statusCode: 400, body: 'User not found' };
        }

        const act_spy = act_user.spies[spyIdx];
        if (!act_spy || act_spy.destroyed) {
          return { statusCode: 400, body: 'Invalid Spy' };
        }

        const move_dst_km = getDistanceFromLatLng(act_spy.spyinfo.lat, act_spy.spyinfo.lng, newSpyInfo.lat, newSpyInfo.lng);
        if(move_dst_km > spy_move_max_radius) {
          return { statusCode: 400, body: 'Invalid move' };
        }

        if(move_dst_km <= spy_move_scan_max_radius) {
          for(var user of usersInRoom) {
            if(user.connectionId === connectionId) continue;

            const assets = [];
            user.caps.map((cap, cap_index) => {
              assets.push({
                destroyed: cap.destroyed,
                scannedBy: cap.scannedBy,
                index: cap_index,
                lat: cap.capinfo.lat,
                lng: cap.capinfo.lng,
                addScannedBy: addScannedByUserCap,
                alert_message: "Your spy found an enemy city!"
              })
            })
            user.spies.map((spy, spy_index) => {
              assets.push({
                destroyed: spy.destroyed,
                scannedBy: spy.scannedBy,
                index: spy_index,
                lat: spy.spyinfo.lat,
                lng: spy.spyinfo.lng,
                addScannedBy: addScannedByUserSpies,
                alert_message: "Your spy found an enemy spy!"
              })
            })

            for(let asset of assets) {
              await ScanForAssets(user.connectionId, asset);
            }
          }
        }

        async function ScanForAssets(asset_connectionId, asset) {
          if(asset.destroyed) return;
          if(asset.scannedBy?.includes(connectionId)) return;

          const dst_km = getDistanceFromLatLng(newSpyInfo.lat, newSpyInfo.lng, asset.lat, asset.lng);
          if(dst_km <= spy_search_radius) {
            await asset.addScannedBy(roomId, asset_connectionId, asset.index, connectionId);
            await sendToConnection(
              connectionId,
              {
                type: 'asset-alert',
                data: {
                  alert_message: asset.alert_message,
                  lat: asset.lat,
                  lng: asset.lng,
                  dur: asset.alert_dur || 5000
                }
              }, domainName, stage
            )
          }
        }

        await setSpyInfo(roomId, connectionId, spyIdx, newSpyInfo);

        usersInRoom = await getUsersInRoom(roomId);
        await SendUpToDateUserData(roomId, connectionId, domainName, stage, usersInRoom);

        return { statusCode: 200, body: 'Spy action complete' };
      }

      case 'client-bomb': {
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
          connectionId, domainName, stage, usersInRoom
        );
        
        let asset_types_hit = new Set();
        const destroyedCaps = new Set();
        
        for(var user of usersInRoom) {
          const assets = [];
          user.caps.map((cap, cap_index) => {
            assets.push({
              type: "cap",
              destroyed: cap.destroyed,
              index: cap_index,
              lat: cap.capinfo.lat,
              lng: cap.capinfo.lng,
              destory: destroyUserCap,
              alert_message: `${cap.capinfo.name} was destroyed!`,
              onlyAlertIf: () => { !destroyedCaps.has(cap.capinfo.name); }, // Dont alert same city more than once
              onAlert: () => { destroyedCaps.add(cap.capinfo.name); }
            })
          })
          user.spies.map((spy, spy_index) => {
            assets.push({
              type: "spy",
              destroyed: spy.destroyed,
              index: spy_index,
              lat: spy.spyinfo.lat,
              lng: spy.spyinfo.lng,
              destory: destroyUserSpies,
              alert_message: `A Spy was destroyed!`
            })
          })

          for(let asset of assets) {
            await BombAsset(user.connectionId, asset);
          }
        }

        async function BombAsset(asset_connectionId, asset) {
          if(asset.destroyed) return;

          const dst_km = getDistanceFromLatLng(bomb.center.lat, bomb.center.lng, asset.lat, asset.lng);
          if(dst_km <= (bomb.radius / 1000.0) ) {
              await asset.destory(roomId, asset_connectionId, asset.index);
              asset_types_hit.add(asset.type)

              if(asset.onlyAlertIf && !asset.onlyAlertIf()) return
              if(asset.onAlert) asset.onAlert();

              await broadcastToRoom(
                roomId,
                {
                  type: 'asset-alert',
                  data: {
                    alert_message: asset.alert_message,
                    lat: asset.lat,
                    lng: asset.lng,
                    dur: asset.alert_dur || 5000
                  }
                }, connectionId, domainName, stage, usersInRoom
              );
          }
        }

        if(asset_types_hit.size > 0) {
          // Get up to date user data
          usersInRoom = await getUsersInRoom(roomId);
          await SendUpToDateUserData(roomId, connectionId, domainName, stage, usersInRoom);

          if(asset_types_hit.has("cap")) {
            await checkWinCondition(room_data, usersInRoom, domainName, stage);
          }
        }

        if(room_data.turnOrder.length != 0) {
          await broadcastToRoom(
            roomId,
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
        }
        
        return { statusCode: 200, body: 'Bomb handled' };
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
          connectionId, domainName, stage
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