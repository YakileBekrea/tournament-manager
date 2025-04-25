import express from "express";
import { engine } from "express-handleBars"
import helmet from "helmet"
import bodyParser, { json } from "body-parser";
import sequelize from "./database";
import { Tourney } from "./models/tourney";
import { Match } from "./models/match";
import { Player } from "./models/player"

const session = require('express-session')

sequelize.sync()

//Server stuff
const port = 3000

const app = express()

app.use(bodyParser())
//app.use(cookieParser())

//TODO: Make this actually display a proper homepage.
app.get("/", (req, res) => {
    res.send("Hey there!");
})

//For now, these get methods just get all the items in the table and display it as json
//TODO: Set up an actual interface for doing this.
//TODO: Set up the rest of the search options
app.get("/matches", async (req, res) => {

    var where = {
        
    }

    if (req.query.winner !== undefined)
    {
        where = {
            ...where,
            winnerId: req.query.winner
        }
    }
    if (req.query.player1 !== undefined)
    {
        where = {
            ...where,
            player1Id: req.query.player1
        }
    }
    if (req.query.player2 !== undefined)
    {
        where = {
            ...where,
            player2Id: req.query.player2
        }
    }

    console.log(where)

    const Matches = await Match.findAll({
        where
    })


    res.json(Matches)
})

app.get("/matches/:id", async (req, res) => {

    const Matches = await Match.findOne({
        where:
        {
            matchId: req.params.id
        }
    })

    //debug for testing the countDaysUntil method.
    //delete later.
    console.log(Matches?.countDaysUntil())

    res.json(Matches)
})

app.get("/players", async (req, res) => {

    const Players = await Player.findAll()

    res.json(Players)
})

app.get("/players/:id", async (req, res) => {

    const player = await Player.findOne({
        where:
        {
            id: req.params.id
        }
    })

    //this part of the method is a debug to test the get win percentage method for matches
    //and the getWonMatches and getWonTournaments methods
    //Delete this later
    console.log(await player?.getWinPercentageMatches())
    console.log(await player?.getWonMatches())
    console.log(await player?.getWonTournaments())

    res.json(player)
})

app.get("/tournaments", async (req, res) => {

    const Tournament = await Tourney.findAll()

    res.json(Tournament)
})

app.get("/tournaments/:id", async (req, res) => {

    const Tournament = await Tourney.findOne({
        where:
        {
            tourneyId: req.params.id
        }
    })

    res.json(Tournament)
})


//Post methods
app.post("/players", async (req, res) => {

    try {
    const name = req.body.name;
    const size = req.body.size;
    const skillLevel = req.body.skillLevel

    await Player.create({
        name,
        size,
        skillLevel
    })
    
    res.status(201).send("Player Registered.");
    }
    catch (error)
    {
        console.log(error)
        res.status(500).send(error)
    }
})

app.post("/tournaments", async (req, res) => {
    try {
    const eventName = req.body.eventName;
    const description = req.body.description;
    const winnerId = req.body.winnerId;

    await Tourney.create({
        eventName,
        description,
        winnerId,
    })

    res.status(201).send("Tournament created.")
    }
    catch (error)
    {
        console.log(error)
        res.status(500).send(error)
    }
})

app.post("/matches", async (req, res) => {
    
    try {
    const player1Id = req.body.player1Id;
    const player2Id = req.body.player2Id;
    const echelon = req.body.echelon;
    const date = req.body.date;
    const winnerId = req.body.winnerId;
    const tourneyId = req.body.tourneyId;

    await Match.create({
        player1Id,
        player2Id,
        echelon,
        date,
        winnerId,
        tourneyId
    })

    res.status(201).send("Match created.")
    }
    catch (error)
    {
        console.log(error)
        res.status(500).send(error)
    }
})

//Delete methods
app.delete("/matches/:id", async (req, res) => {

    await Match.destroy({
        where: {
            matchId: req.params.id
        }
    })

    res.status(200).send("Match " + req.params.id + " deleted")
})

app.delete("/matches", async (req, res) => {


    if (req.body.tourneyId !== null)
    {
        await Match.destroy({
            where: {
            tourneyId: req.body.tourneyId
            }
        })

        res.status(200).send("Matches of Tourney " + req.body.tourneyId + " deleted.")
    }
    else if (req.body.player1Id !== null)
    {
        await Match.destroy({
            where: {
                player1Id: req.body.player1Id
            }
        })

        res.status(200).send("Matches with player " + req.body.player1Id + " deleted.")
    }
    else if (req.body.player2Id !== null)
    {
        await Match.destroy({
            where: {
                player2Id: req.body.player2Id
            }
        })
    }
    else
        res.status(500).send("Please specify proper data.")
})

app.delete("/players/:id", async (req, res) => {

    await Player.destroy({
        where: {
          playerId: req.params.id  
        }
    })

    res.status(200).send("Player " + req.params.id + " deleted")
})

app.delete("/tournaments/:id", async (req, res) => {

    await Match.destroy({
        where: {
            tourneyId: req.params.id
        }
    })

    await Tourney.destroy({
        where: {
            tourneyId: req.params.id
        }
    })

    res.status(200).send("Tournament " + req.params.id + " and its matches deleted.")
})

//Patch methods
//TODO: Test these proper. They have not been tested and may be buggy.
app.patch("/matches/:id", async (req, res) => {

    try {
    const player1Id = req.body.player1Id;
    const player2Id = req.body.player2Id;
    const date = req.body.date;
    const echelon = req.body.echelon;
    const winnerId = req.body.winnerId;
    const tourneyId = req.body.tourneyId;
    const nextMatch = req.body.nextMatch;

    var updater = await Match.findOne({
        where: 
        {
            matchId: req.params.id
        }
    })

    if (updater !== null)
    {
        if (player1Id !== undefined)
        {
            updater.player1Id = player1Id
        }
        if (player2Id !== undefined)
        {
            updater.player2Id = player2Id
        }
        if (date !== undefined)
        {
            updater.date = date
        }
        if (echelon !== undefined)
        {
            updater.echelon = echelon
        }
        if (winnerId !== undefined)
        {
            updater.winnerId = winnerId
        }
        if (tourneyId !== undefined)
        {
            updater.tourneyId = tourneyId
        }
        if (nextMatch !== undefined)
        {
            updater.nextMatch = nextMatch
            updater?.save()

            res.status(200).send("Match " + req.params.id + " updated.")
        }
    }
    else {
        res.status(500).send("No such match of id " + "req.params.id");
    }
    }
    catch (error)
    {
        console.log(error)
        res.status(500).send(error)
    }
})

app.patch("/players/:id", async (req, res) => {

    const name = req.body.name
    const size = req.body.size
    const skillLevel = req.body.skillLevel

    var updater = await Player.findOne({
        where:
        {
            playerId: req.params.id
        }
    })

    if (updater !== null)
    {
        if (name !== null)
        {
            updater.name = name
        }
        if (size !== null)
        {
            updater.size = size
        }
        if (skillLevel !== null)
        {
            updater.skillLevel = skillLevel
        }
        updater?.save()

        res.status(200).send("Player " + req.params.id + " updated.")
    }
    else
    {
        res.status(500).send("No such player of id " + req.params.id)
    }
    
})

app.patch("/tournaments/:id", async (req, res) => {
    const eventName = req.body.eventName
    const description = req.body.description

    var updater = await Tourney.findOne({
        where:
        {
            tourneyId: req.params.id
        }
    })

    if (updater !== null)
    {
        if (eventName !== null)
        {
            updater.eventName = eventName
        }
        if (description !== null)
        {
            updater.description = description
        }
    }
    else
    {
        res.status(500).send("No such tourney of id " + req.params.id)
    }
})

//Start server
app.listen(port, () => {
    console.log("Server is running on port " + port)
})