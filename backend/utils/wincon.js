const { removeIDFromTurnOrder } = require("./gameData");
const { sendToConnection } = require("./send");

async function checkWinCondition(room_data, usersInRoom, domainName, stage)
{
    if(room_data && room_data.turnOrder.length > 0)
    {
        let losing_users = []
        let surv_users = [];
        for(let userID of room_data.turnOrder)
        {
            let user = usersInRoom.find(user => user.connectionId === userID);
            if(user)
            {
                  let has_caps_left = false;
                  for(var cap of user.caps)
                  {
                      if(!cap.discovered)
                      {
                          has_caps_left = true;
                          break;
                      }
                  }
                  if(has_caps_left)
                  {
                      surv_users.push(user);
                  }
                  else
                  {
                      losing_users.push(user);
                  }
            }
        }

        if(surv_users.length === 0) // No survivors, TIE
        {
            // Send remaining players tie message
            for(let userID of room_data.turnOrder)
            {
                await sendToConnection(userID, {'type': 'tie'}, domainName, stage);
            }
        }
        else // Not a tie
        {
            // let the losers know they lost
            for(let user of losing_users)
            {
                await sendToConnection(user.connectionId, {'type': 'lose'}, domainName, stage);
                await removeIDFromTurnOrder(room_data, user.connectionId);
            }
            // If we have a winner let them know
            if(surv_users.length === 1)
            {
                await sendToConnection(surv_users[0].connectionId, {'type': 'win'}, domainName, stage);
                await removeIDFromTurnOrder(room_data, surv_users[0].connectionId);
            }
        }
    }
}

module.exports = {
    checkWinCondition
}