import express from "express";
import { engine } from "express-handleBars"
import bodyParser, { json } from "body-parser";
import sequelize from "./database";
import { Tourney } from "./models/tourney";
import { Match } from "./models/match";
import { Player } from "./models/player"
import { allowInsecurePrototypeAccess } from "@handlebars/allow-prototype-access";
import Handlebars from 'handlebars';
import { Op } from "sequelize";
import session from 'express-session';
import cookieParser from 'cookie-parser';
const SequelizeStore = require('connect-session-sequelize')(session.Store)
const store = new SequelizeStore({ db: sequelize })

sequelize.sync()



//DEBUG THING. DISABLE BEFORE SHIPPING
const authorized = true;

//Server stuff
const port = 3000

const app = express()

declare module "express-session" {
    interface SessionData {
      authorized: boolean;
    }
  }

app.use(bodyParser())
app.use(cookieParser())
app.engine("handlebars", engine({
    handlebars: allowInsecurePrototypeAccess(Handlebars)
}))
app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: true,
    store: store,

    cookie: {
        secure: true,
        maxAge: 3600000 //60 minute age
    }
}))

app.get("/", async (req, res) => {

    const today = new Date().setHours(0,0,0,0)

    const upcomingMatch = await Match.findAll({
        where:
        {
            date: {
                [Op.gt]: today
            }
        }
    })
    
    res.render("home.handlebars", {
        req,
        upcomingMatch,
    })
})

app.get("/admin", (req, res) => {

    res.render("admin.handlebars", {
        req,
        authorized
    })
})

//Basic Get requests
app.get("/matches", async (req, res) => {

    var where = {
        
    }

    if (req.query.winner !== undefined && req.query.winner !== "")
    {
        where = {
            ...where,
            winnerId: req.query.winner
        }
    }
    if (req.query.player1 !== undefined && req.query.player1 !== "")
    {
        where = {
            ...where,
            player1Id: req.query.player1
        }
    }
    if (req.query.player2 !== undefined && req.query.player2 !== "")
    {
        where = {
            ...where,
            player2Id: req.query.player2
        }
    }

    const Matches = await Match.findAll({
        where
    })

    const MatchSearch = true;

    res.render("search.handlebars", {
        req,
        Matches,
        MatchSearch
    })
})

app.get("/matches/:id", async (req, res) => {

    const match = await Match.findOne({
        where:
        {
            matchId: req.params.id
        }
    })

    res.render("match.handlebars", {
        req,
        match
    })
})

app.get("/players", async (req, res) => {

    var where = {

    };

    if (req.query.name !== undefined && req.query.name !== "")
        {
            where = {
                ...where,
                name: req.query.name
            }
        }
        if (req.query.skillLevel !== undefined && req.query.skillLevel !== "")
        {
            where = {
                ...where,
                skillLevel: req.query.skillLevel
            }
        }
        if (req.query.size !== undefined && req.query.size !== "")
        {
            where = {
                ...where,
                size: req.query.size
            }
        }

    const Players = await Player.findAll({
        where
    })

    const PlayerSearch = true;

    res.render("search.handlebars", {
        req,
        Players,
        PlayerSearch
    })
    //res.json(Players)
})

app.get("/players/:id", async (req, res) => {

    const player = await Player.findOne({
        where:
        {
            id: req.params.id
        }
    })

    const wonPercentage = await player?.getWinPercentageMatches()
    const wonCount = await player?.getWonMatches()
    const wonTournaments = await player?.getWonTournaments()

    res.render("player.handlebars", {
        req,
        player,
        wonPercentage,
        wonCount,
        wonTournaments
    })
})

app.get("/tournaments", async (req, res) => {

    var where = {

    }

    if (req.query.eventName !== undefined && req.query.eventName !== "")
        {
            where = {
                ...where,
                eventName: req.query.eventName
            }
        }
        if (req.query.winner !== undefined && req.query.winner !== "")
        {
            where = {
                ...where,
                winnerId: req.query.winner
            }
        }

    const Tournament = await Tourney.findAll({
        where
    })

    var TournamentSearch = true;

    res.render("search.handlebars", {
        req,
        Tournament,
        TournamentSearch
    })
})

app.get("/tournaments/:id", async (req, res) => {

    const Tournament = await Tourney.findOne({
        where:
        {
            tourneyId: req.params.id
        }
    })

    res.render("tournament.handlebars", {
        req,
        Tournament
    })
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
    var player1Id;
    var player2Id;
    const echelon = req.body.echelon;
    var date;
    const winnerId = req.body.winnerId;
    const tourneyId = req.body.tourneyId;

    if (req.body.date !== "")
    {
        date = req.body.date;
    }
    if (req.body.player1Id !== "" && req.body.player1Id !== undefined)
    {
        player1Id = req.body.player1;
    }
    else
    {
        player1Id = null
    }
    if (req.body.player2Id !== "" && req.body.player2Id !== undefined)
    {
        player2Id = req.body.player2;
    }
    else
    {
        player2Id = null
    }

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
            
        }
        updater?.save()

        res.status(200).send("Match " + req.params.id + " updated.")
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
    const winnerId = req.body.winner

    var updater = await Tourney.findOne({
        where:
        {
            tourneyId: req.params.id
        }
    })

    if (updater !== null)
    {
        if (eventName !== undefined)
        {
            updater.eventName = eventName
        }
        if (description !== undefined)
        {
            updater.description = description
        }
        if (winnerId !== undefined)
        {
            updater.winnerId = winnerId
        }

        updater.save()

        res.status(200).send("Tourney " + req.params.id + " updated.")
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