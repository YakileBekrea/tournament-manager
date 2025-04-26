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

Delete methods can be accessed with "/players/id", "/tournaments/id", "/matches/id"

The id routing can be ommited. If so, records will be deleted by priority of the fields specificied in the request's body.
The priorities are

Match:

tourneyId
player1Id
player2Id
winnerId
date

### IMPORTANT

Ensure the secret key defined for session altered from "secretKey." This should be only known to admins and kept safe.