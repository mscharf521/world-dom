const { leaveRoom } = require('../utils/leave');

exports.handler = async (event) => {
  const { connectionId, domainName, stage } = event.requestContext;
  
  try {
    // Find user data by connection ID
    await leaveRoom(connectionId, domainName, stage);

    return { statusCode: 200, body: 'Disconnected' };
  } catch (err) {
    return { 
      statusCode: 500, 
      body: 'Failed to disconnect: ' + JSON.stringify(err) 
    };
  }
}; 