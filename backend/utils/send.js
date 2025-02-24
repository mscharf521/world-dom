const { ApiGatewayManagementApiClient, PostToConnectionCommand } = require("@aws-sdk/client-apigatewaymanagementapi");
const { getUsersInRoom } = require("./gameData");

const sendToConnection = async (connectionId, data, domainName, stage) => {
    let endpoint = `https://${domainName}/${stage}`;
    if(process.env.IS_OFFLINE) endpoint = `http://localhost:3001`;
    
    const client = new ApiGatewayManagementApiClient({
        endpoint
    });

    try {
      await client.send(new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: Buffer.from(JSON.stringify(data))
      }));
    } catch (err) {
      console.error('Error sending message:', err);
      if (err.statusCode === 410) {
        // Connection is stale
        return false;
      }
      throw err;
    }
    return true;
  };
  
  const broadcastToRoom = async (roomId, message, senderConnectionId, domainName, stage, users = null) => {
    if(users == null)
    {
      users = await getUsersInRoom(roomId);
    }
    
    const sendPromises = users
      // .filter(user => user.connectionId !== senderConnectionId)
      .map(user => sendToConnection(user.connectionId, message, domainName, stage));
    
    await Promise.allSettled(sendPromises);
  };

module.exports = {
    sendToConnection,
    broadcastToRoom
};