exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  
  try {

    return { statusCode: 200, body: 'Connected' };
  } catch (err) {
    return { 
      statusCode: 500, 
      body: 'Failed to connect: ' + JSON.stringify(err) 
    };
  }
}; 