import express from "express";
import fs from "fs";
import { engine } from "express-handleBars"
import helmet from "helmet"
import { ParsedQs } from "qs";
import bodyParser from "body-parser";
import { DataTypes, Model, Op, Sequelize } from "sequelize";
import path from "path";


//Models and database
class Player extends Model {
    public id!: number
    public name!: string
    public size!: number
    public skillLevel!: string
    public readonly createdAt!: Date
    public readonly updatedat!: Date

    public async getWinPercentageMatches(): Promise<string> {
        var resultString = "";

        const won = await Match.count({
            where: 
            {
                winnerId: this.id
            }
        })

        //Get both player1 and player 2 id matches.
        const participated = await Match.count({
            where:
            {
                player1Id: this.id,
                //Exclude incomplete matches
                winnerId: {
                    [Op.not]: null
                }
            }
        }) + await Match.count({
            where:
            {
                player2Id: this.id,
                //Exclude incomplete matches
                winnerId: {
                    [Op.not]: null
                }
            }
        })

        resultString = ((won/participated) * 100) + "%"

        return resultString;
    };

    public async getWonMatches(): Promise<number> {
        const won = await Match.count({
            where: {
                winnerId: this.id
            }
        })

        return won;
    }

    public async getWonTournaments(): Promise<number> {
        const won = await Tourney.count({
            where: {
                winnerId: this.id
            }
        })

        return won;
    }

    //TODO: Figure out a way to do a getWonTournamentsPercentage
}

class Match extends Model {
    public matchId!: number
    public echelon!: number
    public date!: Date
    public winnerId!: number
    public player1Id!: number
    public player2Id!: number
    public tourneyId!: number
    public readonly createdAt!: Date
    public readonly updatedAt!: Date

    public async countDaysUntil(): Promise<number> {
        var date = this.date.getTime() - new Date().getTime()

        date /= 86400000

        date = Math.trunc(date)

        return date
    }
}

class Tourney extends Model{
    public tourneyId!: number
    public winnerId!: number
    public eventName!: String
    public description!: String
    public readonly createdAt!: Date
    public readonly updatedAt!: Date
}

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false
  });

Tourney.init(
    {
        tourneyId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        winnerId: {
            type: DataTypes.INTEGER
        },
        eventName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        sequelize,
        modelName: 'Tourney',
        timestamps: true
    }
)

Match.init(
    {
        matchId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        echelon: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        winnerId: {
            type: DataTypes.INTEGER,
        },
        player1Id: {
            type: DataTypes.INTEGER
        },
        player2Id: {
            type: DataTypes.INTEGER
        },
        tourneyId: {
            type: DataTypes.INTEGER,
            allowNull: false
            //currently if this is null, the server crashes. We still can't allow that to be null so...
            //TODO: fix that.
        }
    },
    {
        sequelize,
        modelName: 'Match',
        timestamps: true
    }
)

Player.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [3,100]
            },
            unique: true
        },
        size: {
            type: DataTypes.INTEGER,
            validate: {
                min: 1,
                max: 16   
            }
        },
        skillLevel: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['beginner', 'intermediate', 'expert', 'master', 'grandmaster']]
            }
        }
    },
    {
        sequelize,
        modelName: 'Player'
    }
)

Match.belongsTo(Tourney, {
    foreignKey: 'tourneyId'
})
//TODO: implement the rest of the associations.
//Match.hasMany(Player, {
    //foreignKey: '',
//})
//Tourney.hasOne(Player, {
    //foreignKey: 'winnerId'
//})

sequelize.sync()

//TODO: Consider moving each of the models into their own file. This current set up is fine for now, but will get cumbersome later.

//Server stuff
const port = 3000

const app = express()

app.use(bodyParser())

//TODO: Make this actually display a proper homepage.
app.get("/", (req, res) => {
    res.send("Hey there!");
})

//For now, these get methods just get all the items in the table and display it as json
//TODO: Set up an actual interface for doing this.
app.get("/matches", async (req, res) => {

    const Matches = await Match.findAll()

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
    const name = req.body.name;
    const size = req.body.size;
    const skillLevel = req.body.skillLevel

    await Player.create({
        name,
        size,
        skillLevel
    })
    res.status(201).send("Player Registered.");
})

app.post("/tournaments", async (req, res) => {
    const eventName = req.body.eventName;
    const description = req.body.description;
    const winnerId = req.body.winnerId;

    await Tourney.create({
        eventName,
        description,
        winnerId,
    })

    res.status(201).send("Tournament created.")
})

app.post("/matches", async (req, res) => {
    
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

app.delete("/players/:id", async (req, res) => {

    await Player.destroy({
        where: {
          playerId: req.params.id  
        }
    })

    res.status(200).send("Player " + req.params.id + " deleted")
})

app.delete("/tournaments/:id", async (req, res) => {

    await Tourney.destroy({
        where: {
            tourneyId: req.params.id
        }
    })

    res.status(200).send("Tournament " + req.params.id + " deleted.")
})

//Patch methods
//TODO: Test these proper. They have not been tested and may be buggy.
app.patch("/matches/:id", async (req, res) => {

    const player1Id = req.body.player1Id;
    const player2Id = req.body.player2Id;
    const date = req.body.date;
    const echelon = req.body.echelon;
    const winnerId = req.body.winnerId;
    const tourneyId = req.body.tourneyId;

    var updater = await Match.findOne({
        where: 
        {
            matchId: req.params.id
        }
    })

    if (updater !== null)
    {
        if (player1Id !== null)
        {
            updater.player1Id = player1Id
        }
        if (player2Id !== null)
        {
            updater.player2Id = player2Id
        }
        if (date !== null)
        {
            updater.date = date
        }
        if (echelon !== null)
        {
            updater.echelon = echelon
        }
        if (winnerId !== null)
        {
            updater.winnerId = winnerId
        }
        if (tourneyId !== null)
        {
            updater.tourneyId = tourneyId
        }
    }

    updater?.save()

    res.status(200).send("Match " + req.params.id + " updated.")
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
    }

    updater?.save()

    res.status(200).send("Player " + req.params.id + " updated.")
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
})

//Start server
app.listen(port, () => {
    console.log("Server is running on port " + port)
})

//TODO
//chop some of this up into individual files, we're at 500+ lines and this is becoming very cumbersome
//do that next to prevent it from getting even more out of hand.