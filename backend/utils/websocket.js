const { ApiGatewayManagementApiClient, PostToConnectionCommand } = require('@aws-sdk/client-apigatewaymanagementapi');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DeleteCommand, DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const send = async (connectionId, data, domainName, stage) => {
  const client = new ApiGatewayManagementApiClient({
    endpoint: `https://${domainName}/${stage}`
  });

  const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

  try {
    await client.send(new PostToConnectionCommand({
      ConnectionId: connectionId,
      Data: JSON.stringify(data)
    }));
  } catch (err) {
    if (err.statusCode === 410) {
      // Remove stale connections
      await docClient.send(new DeleteCommand({
        TableName: process.env.CONNECTIONS_TABLE,
        Key: { connectionId }
      }));
    }
  }
};

module.exports = { send }; 