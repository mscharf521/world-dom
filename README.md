# World Domination

A multiplayer strategy game where players compete to discover and destroy each other's hidden capital cities across the globe.

## Key Features
- Real-time multiplayer gameplay
- Interactive world map using Google Maps API
- City and Flag API's for useful information about selected cities
- In-game chat system
- Shareable room links for easy joining

## 🎮 How to Play

1. **Join or Create a Room**
   - Enter your name and a room code
   - Share the room link with friends to invite them

2. **Select Your Capitals**
   - Choose your secret capital cities when the game begins
   - Cities with larger populations give you more powerful weapons

3. **Take Turns**
   - Launch nuclear strikes during your turn
   - Try to discover and destroy enemy capitals

4. **Win Condition**
   - Be the last player with surviving capital cities

## Addtional Rules

To add more strategy and a social aspect to the game, the rules can be modified. For example, on your turn you can ask yes or no questions to the other players to help you deduce their capital cities. You can also agree on a population threshold for the cities that you can choose from. Or you can agree on a certain region of the map that you can choose from. 

#Development Notes

2/24/2025
The frontend was rebuilt using latest version of Vite and React. The dependencies for using the Google Maps API were not updated and it is using some older features that may be deprecated in the future.
The backend was rearchitected to be serverless using AWS API Gateway, AWS Lambda functions and DynamoDB. This architecture lowers costs and is much more scalable compared to the previous Node.js/Express backend with state data stored in memory. There are still some data efficiency improvements that can be made to decrease overall costs. Also, if the WebSocket connnection is lost, reconnection is not supported.
