const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { 
  PutCommand, 
  GetCommand, 
  QueryCommand, 
  UpdateCommand,
  DynamoDBDocumentClient 
} = require('@aws-sdk/lib-dynamodb');

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const TTL_1_DAY = 1000 * 60 * 60 * 24;

// ROOM DATA
const createRoom = async (roomId, password) => {
  const room = {
    PK: `ROOM#${roomId}`,
    SK: 'METADATA',
    gameStarted: false,
    turnOrder: [],
    turnIndex: 0,
    bombs: [],
    num_caps: 3,
    ttl: Date.now() + TTL_1_DAY
  };

  await docClient.send(new PutCommand({
    TableName: process.env.GAME_TABLE,
    Item: room
  }));

  room.id = room.PK.split('#')[1];
  return room;
};

const getRoomData = async (roomId) => {
  const room = await docClient.send(new GetCommand({
    TableName: process.env.GAME_TABLE,
    Key: {
      PK: `ROOM#${roomId}`,
      SK: 'METADATA'
    }
  }));

  if(room.Item)
  {
    room.Item.id = room.Item.PK.split('#')[1];
  }
  return room.Item;
};  

const addBombToRoom = async (roomId, bomb) => {
  await docClient.send(new UpdateCommand({
    TableName: process.env.GAME_TABLE,
    Key: { PK: `ROOM#${roomId}`, SK: 'METADATA' },
    UpdateExpression: 'set bombs = list_append(bombs, :bomb)',
    ExpressionAttributeValues: {
      ':bomb': [bomb]
    }
  }));
};

const setRoomGameStarted = async (roomId) => {
  await docClient.send(new UpdateCommand({
    TableName: process.env.GAME_TABLE,
    Key: { PK: `ROOM#${roomId}`, SK: 'METADATA' },
    UpdateExpression: 'set gameStarted = :gameStarted',
    ExpressionAttributeValues: {
      ':gameStarted': true
    }
  }));
};

const setRoomTurnOrder = async (roomId, turnOrder) => {
  await docClient.send(new UpdateCommand({
    TableName: process.env.GAME_TABLE,
    Key: { PK: `ROOM#${roomId}`, SK: 'METADATA' },
    UpdateExpression: 'set turnOrder = :turnOrder',
    ExpressionAttributeValues: {
      ':turnOrder': turnOrder
    }
  }));
};  

const incRoomTurnIndex = async (roomId) => {
  const room = await getRoomData(roomId);
  let turnIndex = room.turnIndex + 1;
  if(turnIndex >= room.turnOrder.length)
  {
    turnIndex = 0;
  }

  await docClient.send(new UpdateCommand({
    TableName: process.env.GAME_TABLE,
    Key: { PK: `ROOM#${roomId}`, SK: 'METADATA' },
    UpdateExpression: 'set turnIndex = :turnIndex',
    ExpressionAttributeValues: {  
      ':turnIndex': turnIndex
    }
  }));
};

const removeIDFromTurnOrder = async (room_data, rm_id) => {
  await docClient.send(new UpdateCommand({
    TableName: process.env.GAME_TABLE,
    Key: { PK: `ROOM#${room_data.id}`, SK: 'METADATA' },
    UpdateExpression: 'set turnOrder = :turnOrder',
    ExpressionAttributeValues: {
      ':turnOrder': room_data.turnOrder.filter(id => id !== rm_id)
    }
  }));
};  

const removeRoom = async (roomId) => {
  await docClient.send(new DeleteCommand({
    TableName: process.env.GAME_TABLE,
    Key: { PK: `ROOM#${roomId}`, SK: 'METADATA' }
  }));
};

// USER DATA
const createUser = async (roomId, connectionId, username) => {
  const user = {
    PK: `ROOM#${roomId}`,
    SK: `USER#${connectionId}`,
    GSI1PK: `CONN#${connectionId}`,
    GSI1SK: roomId,
    username,
    caps: [],
    ttl: Date.now() + TTL_1_DAY
  };

  await docClient.send(new PutCommand({
    TableName: process.env.GAME_TABLE,
    Item: user
  }));

  user.connectionId = user.SK.split('#')[1];

  return user;
};

const getUsersInRoom = async (roomId) => {
  const users = await docClient.send(new QueryCommand({
    TableName: process.env.GAME_TABLE,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `ROOM#${roomId}`,
      ':sk': 'USER#'
    }
  }));
  return users.Items.map(user => ({
    ...user,
    connectionId: user.SK.split('#')[1],
  })) ;
};

const getUserByConnection = async (connectionId) => {
  const result = await docClient.send(new QueryCommand({
    TableName: process.env.GAME_TABLE,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk',
    ExpressionAttributeValues: {
      ':pk': `CONN#${connectionId}`
    }
  }));

  if(result.Items.length > 0)
  {
    result.Items[0].room = result.Items[0].GSI1SK;
    result.Items[0].connectionId = result.Items[0].SK.split('#')[1];
    return result.Items[0];
  }
  return null;
};

const setUserCapitals = async (roomId, connectionId, capitals) => {
  await docClient.send(new UpdateCommand({
    TableName: process.env.GAME_TABLE,
    Key: {
      PK: `ROOM#${roomId}`,
      SK: `USER#${connectionId}`
    },
    UpdateExpression: 'set caps = :capitals',
    ExpressionAttributeValues: {
      ':capitals': capitals
    }
  }));
};

const discoverUserCap = async (roomId, connectionId, index) => {
  await docClient.send(new UpdateCommand({
    TableName: process.env.GAME_TABLE,
    Key: { PK: `ROOM#${roomId}`, SK: `USER#${connectionId}` },
    UpdateExpression: 'set caps[' + index + '].discovered = :discovered',
    ExpressionAttributeValues: {
      ':discovered': true
    }
  }));
};

const removeUserFromRoom = async (roomId, connectionId) => {
  await docClient.send(new DeleteCommand({
    TableName: process.env.GAME_TABLE,
    Key: { PK: `ROOM#${roomId}`, SK: `USER#${connectionId}` }
  }));
};

module.exports = {
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
  removeIDFromTurnOrder,
  removeUserFromRoom,
  removeRoom
}; 