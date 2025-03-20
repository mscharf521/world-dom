const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { 
  PutCommand, 
  GetCommand, 
  DeleteCommand,
  QueryCommand, 
  UpdateCommand,
  DynamoDBDocumentClient 
} = require('@aws-sdk/lib-dynamodb');

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const TTL_12_HOURS_MS = 1000 * 60 * 60 * 12;
const GetTTL = () => (Date.now() + TTL_12_HOURS_MS) / 1000;

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
    min_pop: 0,
    only_caps: false,
    country_whitelist: [],
    country_blacklist: [],
    bomb_scale: 100,
    num_spies: 0,
    num_boats: 0,
    ttl: GetTTL()
  };

  await docClient.send(new PutCommand({
    TableName: process.env.GAME_TABLE,
    Item: room
  }));

  room.id = room.PK.split('#')[1];
  room.settings = {
    numberOfCapitals: room.num_caps,
    numberOfSpies: room.num_spies,
    numberOfBoats: room.num_boats,
    minPopulation: room.min_pop,
    onlyCapitals: room.only_caps,
    whitelistCountries: room.country_whitelist,
    blacklistCountries: room.country_blacklist
  };
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
    room.Item.settings = {
      numberOfCapitals: room.Item.num_caps,
      minPopulation: room.Item.min_pop,
      onlyCapitals: room.Item.only_caps,
      whitelistCountries: room.Item.country_whitelist,
      blacklistCountries: room.Item.country_blacklist,
      bombScale: room.Item.bomb_scale,
      numberOfSpies: room.Item.num_spies,
      numberOfBoats: room.Item.num_boats
    };
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
const setRoomSettings = async (roomId, settings) => {
  const updateExpression = `
    set 
      num_caps = :num_caps, 
      min_pop = :min_pop, 
      only_caps = :only_caps, 
      country_whitelist = :country_whitelist, 
      country_blacklist = :country_blacklist, 
      bomb_scale = :bomb_scale, 
      num_spies = :num_spies, 
      num_boats = :num_boats
  `;

  const expressionAttributeValues = {
    ':num_caps': settings.numberOfCapitals,
    ':min_pop': settings.minPopulation,
    ':only_caps': settings.onlyCapitals,
    ':country_whitelist': settings.whitelistCountries,
    ':country_blacklist': settings.blacklistCountries,
    ':bomb_scale': settings.bombScale,
    ':num_spies': settings.numberOfSpies,
    ':num_boats': settings.numberOfBoats
  };

  await docClient.send(new UpdateCommand({
    TableName: process.env.GAME_TABLE,
    Key: { PK: `ROOM#${roomId}`, SK: 'METADATA' },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues
  }));
};

const incRoomTurnIndex = async (roomId) => {
  const room = await getRoomData(roomId);
  let turnIndex = room.turnIndex + 1;
  if(turnIndex >= room.turnOrder.length) turnIndex = 0;

  await docClient.send(new UpdateCommand({
    TableName: process.env.GAME_TABLE,
    Key: { PK: `ROOM#${roomId}`, SK: 'METADATA' },
    UpdateExpression: 'set turnIndex = :turnIndex',
    ExpressionAttributeValues: {  
      ':turnIndex': turnIndex
    }
  }));

  return turnIndex;
};

const decRoomTurnIndex = async (roomId) => {
  const room = await getRoomData(roomId);
  let turnIndex = room.turnIndex - 1;
  if(turnIndex < 0) turnIndex = room.turnOrder.length - 1;

  await docClient.send(new UpdateCommand({
    TableName: process.env.GAME_TABLE,
    Key: { PK: `ROOM#${roomId}`, SK: 'METADATA' },
    UpdateExpression: 'set turnIndex = :turnIndex',
    ExpressionAttributeValues: {  
      ':turnIndex': turnIndex
    }
  }));

  return turnIndex;
};

const removeIDFromTurnOrder = async (room_data, rm_id) => {
  const idx = room_data.turnOrder.findIndex(id => id == rm_id);
  if(idx < room_data.turnIndex) {
    room_data.turnIndex = await decRoomTurnIndex(room_data.id);
  }

  room_data.turnOrder = room_data.turnOrder.filter(id => id !== rm_id)
  await docClient.send(new UpdateCommand({
    TableName: process.env.GAME_TABLE,
    Key: { PK: `ROOM#${room_data.id}`, SK: 'METADATA' },
    UpdateExpression: 'set turnOrder = :turnOrder',
    ExpressionAttributeValues: {
      ':turnOrder': room_data.turnOrder
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
    spies: [],
    boats: [],
    ttl: GetTTL()
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
    result.Items[0].username = result.Items[0].username;
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

const addScannedByUserCap = async (roomId, connectionId, index, scannerId) => {
  await addScannedByInList(roomId, connectionId, "caps", index, scannerId);
};
const addScannedByUserSpies = async (roomId, connectionId, index, scannerId) => {
  await addScannedByInList(roomId, connectionId, "spies", index, scannerId);
};
const addScannedByUserBoats = async (roomId, connectionId, index, scannerId) => {
  await addScannedByInList(roomId, connectionId, "boats", index, scannerId);
};
const addScannedByInList = async (roomId, connectionId, list_name, index, scannerId) => {
  const list_str = list_name + '[' + index + ']';
  await docClient.send(new UpdateCommand({
    TableName: process.env.GAME_TABLE,
    Key: { PK: `ROOM#${roomId}`, SK: `USER#${connectionId}` },
    UpdateExpression: `set ${list_str}.scannedBy = list_append(${list_str}.scannedBy, :scannedBy)`,
    ExpressionAttributeValues: {
      ':scannedBy': [scannerId]
    }
  }));
};

const destroyUserCap = async (roomId, connectionId, index) => {
  await destroyInList(roomId, connectionId, "caps", index);
};
const destroyUserSpies = async (roomId, connectionId, index) => {
  await destroyInList(roomId, connectionId, "spies", index);
}
const destroyUserBoats = async (roomId, connectionId, index) => {
  await destroyInList(roomId, connectionId, "boats", index);
}
const destroyInList = async (roomId, connectionId, list_name, index) => {
  const list_str = list_name + '[' + index + ']';
  await docClient.send(new UpdateCommand({
    TableName: process.env.GAME_TABLE,
    Key: { PK: `ROOM#${roomId}`, SK: `USER#${connectionId}` },
    UpdateExpression: `set ${list_str}.destroyed = :destroyed`,
    ExpressionAttributeValues: {
      ':destroyed': true
    }
  }));
};

const setUserSpies = async (roomId, connectionId, spies) => {
  await docClient.send(new UpdateCommand({
    TableName: process.env.GAME_TABLE,
    Key: {
      PK: `ROOM#${roomId}`,
      SK: `USER#${connectionId}`
    },
    UpdateExpression: 'set spies = :spies',
    ExpressionAttributeValues: {
      ':spies': spies
    }
  }));
};

const setSpyInfo = async (roomId, connectionId, index, info) => {
  await docClient.send(new UpdateCommand({
    TableName: process.env.GAME_TABLE,
    Key: { PK: `ROOM#${roomId}`, SK: `USER#${connectionId}` },
    UpdateExpression: `set spies[${index}].spyinfo = :info`,
    ExpressionAttributeValues: {
      ':info': info
    }
  }));
}; 

const setUserBoats = async (roomId, connectionId, boats) => {
  await docClient.send(new UpdateCommand({
    TableName: process.env.GAME_TABLE,
    Key: {
      PK: `ROOM#${roomId}`,
      SK: `USER#${connectionId}`
    },
    UpdateExpression: 'set boats = :boats',
    ExpressionAttributeValues: {
      ':boats': boats
    }
  }));
};

const setBoatInfo = async (roomId, connectionId, index, info) => {
  await docClient.send(new UpdateCommand({
    TableName: process.env.GAME_TABLE,
    Key: { PK: `ROOM#${roomId}`, SK: `USER#${connectionId}` },
    UpdateExpression: `set boats[${index}].boatinfo = :info`,
    ExpressionAttributeValues: {
      ':info': info
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
  setUserSpies,
  destroyUserCap,
  destroyUserSpies,
  addScannedByUserCap,
  addScannedByUserSpies,
  incRoomTurnIndex,
  removeIDFromTurnOrder,
  removeUserFromRoom,
  removeRoom,
  setRoomSettings,
  setSpyInfo,
  setBoatInfo,
  setUserBoats,
  destroyUserBoats,
  addScannedByUserBoats
};