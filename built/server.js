"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const sequelize_1 = require("sequelize");
const path_1 = __importDefault(require("path"));
//Models and database
class Player extends sequelize_1.Model {
    getWinPercentageMatches() {
        return __awaiter(this, void 0, void 0, function* () {
            var resultString = "";
            const won = yield Match.count({
                where: {
                    winnerId: this.id
                }
            });
            //Get both player1 and player 2 id matches.
            const participated = (yield Match.count({
                where: {
                    player1Id: this.id,
                    //Exclude incomplete matches
                    winnerId: {
                        [sequelize_1.Op.not]: null
                    }
                }
            })) + (yield Match.count({
                where: {
                    player2Id: this.id,
                    //Exclude incomplete matches
                    winnerId: {
                        [sequelize_1.Op.not]: null
                    }
                }
            }));
            resultString = ((won / participated) * 100) + "%";
            return resultString;
        });
    }
    ;
    getWonMatches() {
        return __awaiter(this, void 0, void 0, function* () {
            const won = yield Match.count({
                where: {
                    winnerId: this.id
                }
            });
            return won;
        });
    }
    getWonTournaments() {
        return __awaiter(this, void 0, void 0, function* () {
            const won = yield Tourney.count({
                where: {
                    winnerId: this.id
                }
            });
            return won;
        });
    }
}
class Match extends sequelize_1.Model {
    countDaysUntil() {
        return __awaiter(this, void 0, void 0, function* () {
            var date = this.date.getTime() - new Date().getTime();
            date /= 86400000;
            date = Math.trunc(date);
            return date;
        });
    }
}
class Tourney extends sequelize_1.Model {
}
const sequelize = new sequelize_1.Sequelize({
    dialect: 'sqlite',
    storage: path_1.default.join(__dirname, 'database.sqlite'),
    logging: false
});
Tourney.init({
    tourneyId: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    winnerId: {
        type: sequelize_1.DataTypes.INTEGER
    },
    eventName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Tourney',
    timestamps: true
});
Match.init({
    matchId: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    echelon: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW
    },
    winnerId: {
        type: sequelize_1.DataTypes.INTEGER,
    },
    player1Id: {
        type: sequelize_1.DataTypes.INTEGER
    },
    player2Id: {
        type: sequelize_1.DataTypes.INTEGER
    },
    tourneyId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
        //currently if this is null, the server crashes. We still can't allow that to be null so...
        //TODO: fix that.
    }
}, {
    sequelize,
    modelName: 'Match',
    timestamps: true
});
Player.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [3, 100]
        },
        unique: true
    },
    size: {
        type: sequelize_1.DataTypes.INTEGER,
        validate: {
            min: 1,
            max: 16
        }
    },
    skillLevel: {
        type: sequelize_1.DataTypes.STRING,
        validate: {
            isIn: [['beginner', 'intermediate', 'expert', 'master', 'grandmaster']]
        }
    }
}, {
    sequelize,
    modelName: 'Player'
});
Match.belongsTo(Tourney, {
    foreignKey: 'tourneyId'
});
//TODO: implement the rest of the associations.
//Match.hasMany(Player, {
//foreignKey: '',
//})
//Tourney.hasOne(Player, {
//foreignKey: 'winnerId'
//})
sequelize.sync();
//TODO: Consider moving each of the models into their own file. This current set up is fine for now, but will get cumbersome later.
//Server stuff
const port = 3000;
const app = (0, express_1.default)();
app.use((0, body_parser_1.default)());
//TODO: Make this actually display a proper homepage.
app.get("/", (req, res) => {
    res.send("Hey there!");
});
//For now, these get methods just get all the items in the table and display it as json
//TODO: Set up an actual interface for doing this.
app.get("/matches", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const Matches = yield Match.findAll();
    res.json(Matches);
}));
app.get("/matches/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const Matches = yield Match.findOne({
        where: {
            matchId: req.params.id
        }
    });
    //debug for testing the countDaysUntil method.
    //delete later.
    console.log(Matches === null || Matches === void 0 ? void 0 : Matches.countDaysUntil());
    res.json(Matches);
}));
app.get("/players", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const Players = yield Player.findAll();
    res.json(Players);
}));
app.get("/players/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const player = yield Player.findOne({
        where: {
            id: req.params.id
        }
    });
    //this part of the method is a debug to test the get win percentage method for matches
    //and the getWonMatches and getWonTournaments methods
    //Delete this later
    console.log(yield (player === null || player === void 0 ? void 0 : player.getWinPercentageMatches()));
    console.log(yield (player === null || player === void 0 ? void 0 : player.getWonMatches()));
    console.log(yield (player === null || player === void 0 ? void 0 : player.getWonTournaments()));
    res.json(player);
}));
app.get("/tournaments", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const Tournament = yield Tourney.findAll();
    res.json(Tournament);
}));
app.get("/tournaments/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const Tournament = yield Tourney.findOne({
        where: {
            tourneyId: req.params.id
        }
    });
    res.json(Tournament);
}));
//Post methods
app.post("/players", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const name = req.body.name;
    const size = req.body.size;
    const skillLevel = req.body.skillLevel;
    yield Player.create({
        name,
        size,
        skillLevel
    });
    res.status(201).send("Player Registered.");
}));
app.post("/tournaments", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const eventName = req.body.eventName;
    const description = req.body.description;
    const winnerId = req.body.winnerId;
    yield Tourney.create({
        eventName,
        description,
        winnerId,
    });
    res.status(201).send("Tournament created.");
}));
app.post("/matches", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const player1Id = req.body.player1Id;
    const player2Id = req.body.player2Id;
    const echelon = req.body.echelon;
    const date = req.body.date;
    const winnerId = req.body.winnerId;
    const tourneyId = req.body.tourneyId;
    yield Match.create({
        player1Id,
        player2Id,
        echelon,
        date,
        winnerId,
        tourneyId
    });
    res.status(201).send("Match created.");
}));
//Delete methods
app.delete("/matches/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield Match.destroy({
        where: {
            matchId: req.params.id
        }
    });
    res.status(200).send("Match " + req.params.id + " deleted");
}));
app.delete("/players/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield Player.destroy({
        where: {
            playerId: req.params.id
        }
    });
    res.status(200).send("Player " + req.params.id + " deleted");
}));
app.delete("/tournaments/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield Tourney.destroy({
        where: {
            tourneyId: req.params.id
        }
    });
    res.status(200).send("Tournament " + req.params.id + " deleted.");
}));
//Patch methods
//TODO: Test these proper. They have not been tested and may be buggy.
app.patch("/matches/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const player1Id = req.body.player1Id;
    const player2Id = req.body.player2Id;
    const date = req.body.date;
    const echelon = req.body.echelon;
    const winnerId = req.body.winnerId;
    const tourneyId = req.body.tourneyId;
    var updater = yield Match.findOne({
        where: {
            matchId: req.params.id
        }
    });
    if (updater !== null) {
        if (player1Id !== null) {
            updater.player1Id = player1Id;
        }
        if (player2Id !== null) {
            updater.player2Id = player2Id;
        }
        if (date !== null) {
            updater.date = date;
        }
        if (echelon !== null) {
            updater.echelon = echelon;
        }
        if (winnerId !== null) {
            updater.winnerId = winnerId;
        }
        if (tourneyId !== null) {
            updater.tourneyId = tourneyId;
        }
    }
    updater === null || updater === void 0 ? void 0 : updater.save();
    res.status(200).send("Match " + req.params.id + " updated.");
}));
app.patch("/players/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const name = req.body.name;
    const size = req.body.size;
    const skillLevel = req.body.skillLevel;
    var updater = yield Player.findOne({
        where: {
            playerId: req.params.id
        }
    });
    if (updater !== null) {
        if (name !== null) {
            updater.name = name;
        }
        if (size !== null) {
            updater.size = size;
        }
        if (skillLevel !== null) {
            updater.skillLevel = skillLevel;
        }
    }
    updater === null || updater === void 0 ? void 0 : updater.save();
    res.status(200).send("Player " + req.params.id + " updated.");
}));
app.patch("/tournaments/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const eventName = req.body.eventName;
    const description = req.body.description;
    var updater = yield Tourney.findOne({
        where: {
            tourneyId: req.params.id
        }
    });
    if (updater !== null) {
        if (eventName !== null) {
            updater.eventName = eventName;
        }
        if (description !== null) {
            updater.description = description;
        }
    }
}));
//Start server
app.listen(port, () => {
    console.log("Server is running on port " + port);
});
//TODO
//chop some of this up into individual files, we're at 500+ lines and this is becoming very cumbersome
//do that next to prevent it from getting even more out of hand.
