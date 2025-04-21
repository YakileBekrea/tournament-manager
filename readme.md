### This is a tournament manager server built on express.

To use, run the following commands:
npm run build
npm run start

The server will run on the port specified in server.ts. By default 3000

### MODEL STRUCTURE

When using the post and patch methods, specifiy these fields:

Player:

name
size
skillLevel

Match:
player1Id (optional)
player2Id (optional)
winnerId (optional)
date (optional)
tourneyId

Tournament

eventName
description