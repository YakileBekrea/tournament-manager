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
const express_handleBars_1 = require("express-handleBars");
const body_parser_1 = __importDefault(require("body-parser"));
const database_1 = __importDefault(require("./database"));
const tourney_1 = require("./models/tourney");
const match_1 = require("./models/match");
const player_1 = require("./models/player");
const allow_prototype_access_1 = require("@handlebars/allow-prototype-access");
const session = require('express-session');
database_1.default.sync();
//Server stuff
const port = 3000;
const app = (0, express_1.default)();
app.use((0, body_parser_1.default)());
//app.use(cookieParser())
const Handlebars = require('handlebars');
app.engine("handlebars", (0, express_handleBars_1.engine)({
    handlebars: (0, allow_prototype_access_1.allowInsecurePrototypeAccess)(Handlebars)
}));
//TODO: Make this actually display a proper homepage.
app.get("/", (req, res) => {
    res.send("Hey there!");
});
//For now, these get methods just get all the items in the table and display it as json
//TODO: Set up an actual interface for doing this.
app.get("/matches", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var where = {};
    if (req.query.winner !== undefined) {
        where = Object.assign(Object.assign({}, where), { winnerId: req.query.winner });
    }
    if (req.query.player1 !== undefined) {
        where = Object.assign(Object.assign({}, where), { player1Id: req.query.player1 });
    }
    if (req.query.player2 !== undefined) {
        where = Object.assign(Object.assign({}, where), { player2Id: req.query.player2 });
    }
    console.log(where);
    const Matches = yield match_1.Match.findAll({
        where
    });
    res.json(Matches);
}));
app.get("/matches/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const Matches = yield match_1.Match.findOne({
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
    const Players = yield player_1.Player.findAll();
    res.render("search.handlebars", {
        req,
        Players
    });
    //res.json(Players)
}));
app.get("/players/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const player = yield player_1.Player.findOne({
        where: {
            id: req.params.id
        }
    });
    const wonPercentage = yield (player === null || player === void 0 ? void 0 : player.getWinPercentageMatches());
    const wonCount = yield (player === null || player === void 0 ? void 0 : player.getWonMatches());
    const wonTournaments = yield (player === null || player === void 0 ? void 0 : player.getWonTournaments());
    res.render("player.handlebars", {
        req,
        player,
        wonPercentage,
        wonCount,
        wonTournaments
    });
}));
app.get("/tournaments", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const Tournament = yield tourney_1.Tourney.findAll();
    res.json(Tournament);
}));
app.get("/tournaments/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const Tournament = yield tourney_1.Tourney.findOne({
        where: {
            tourneyId: req.params.id
        }
    });
    res.json(Tournament);
}));
//Post methods
app.post("/players", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const name = req.body.name;
        const size = req.body.size;
        const skillLevel = req.body.skillLevel;
        yield player_1.Player.create({
            name,
            size,
            skillLevel
        });
        res.status(201).send("Player Registered.");
    }
    catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}));
app.post("/tournaments", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventName = req.body.eventName;
        const description = req.body.description;
        const winnerId = req.body.winnerId;
        yield tourney_1.Tourney.create({
            eventName,
            description,
            winnerId,
        });
        res.status(201).send("Tournament created.");
    }
    catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}));
app.post("/matches", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const player1Id = req.body.player1Id;
        const player2Id = req.body.player2Id;
        const echelon = req.body.echelon;
        const date = req.body.date;
        const winnerId = req.body.winnerId;
        const tourneyId = req.body.tourneyId;
        yield match_1.Match.create({
            player1Id,
            player2Id,
            echelon,
            date,
            winnerId,
            tourneyId
        });
        res.status(201).send("Match created.");
    }
    catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}));
//Delete methods
app.delete("/matches/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield match_1.Match.destroy({
        where: {
            matchId: req.params.id
        }
    });
    res.status(200).send("Match " + req.params.id + " deleted");
}));
app.delete("/matches", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.tourneyId !== null) {
        yield match_1.Match.destroy({
            where: {
                tourneyId: req.body.tourneyId
            }
        });
        res.status(200).send("Matches of Tourney " + req.body.tourneyId + " deleted.");
    }
    else if (req.body.player1Id !== null) {
        yield match_1.Match.destroy({
            where: {
                player1Id: req.body.player1Id
            }
        });
        res.status(200).send("Matches with player " + req.body.player1Id + " deleted.");
    }
    else if (req.body.player2Id !== null) {
        yield match_1.Match.destroy({
            where: {
                player2Id: req.body.player2Id
            }
        });
    }
    else
        res.status(500).send("Please specify proper data.");
}));
app.delete("/players/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield player_1.Player.destroy({
        where: {
            playerId: req.params.id
        }
    });
    res.status(200).send("Player " + req.params.id + " deleted");
}));
app.delete("/tournaments/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield match_1.Match.destroy({
        where: {
            tourneyId: req.params.id
        }
    });
    yield tourney_1.Tourney.destroy({
        where: {
            tourneyId: req.params.id
        }
    });
    res.status(200).send("Tournament " + req.params.id + " and its matches deleted.");
}));
//Patch methods
//TODO: Test these proper. They have not been tested and may be buggy.
app.patch("/matches/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const player1Id = req.body.player1Id;
        const player2Id = req.body.player2Id;
        const date = req.body.date;
        const echelon = req.body.echelon;
        const winnerId = req.body.winnerId;
        const tourneyId = req.body.tourneyId;
        const nextMatch = req.body.nextMatch;
        var updater = yield match_1.Match.findOne({
            where: {
                matchId: req.params.id
            }
        });
        if (updater !== null) {
            if (player1Id !== undefined) {
                updater.player1Id = player1Id;
            }
            if (player2Id !== undefined) {
                updater.player2Id = player2Id;
            }
            if (date !== undefined) {
                updater.date = date;
            }
            if (echelon !== undefined) {
                updater.echelon = echelon;
            }
            if (winnerId !== undefined) {
                updater.winnerId = winnerId;
            }
            if (tourneyId !== undefined) {
                updater.tourneyId = tourneyId;
            }
            if (nextMatch !== undefined) {
                updater.nextMatch = nextMatch;
                updater === null || updater === void 0 ? void 0 : updater.save();
                res.status(200).send("Match " + req.params.id + " updated.");
            }
        }
        else {
            res.status(500).send("No such match of id " + "req.params.id");
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}));
app.patch("/players/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const name = req.body.name;
    const size = req.body.size;
    const skillLevel = req.body.skillLevel;
    var updater = yield player_1.Player.findOne({
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
        updater === null || updater === void 0 ? void 0 : updater.save();
        res.status(200).send("Player " + req.params.id + " updated.");
    }
    else {
        res.status(500).send("No such player of id " + req.params.id);
    }
}));
app.patch("/tournaments/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const eventName = req.body.eventName;
    const description = req.body.description;
    var updater = yield tourney_1.Tourney.findOne({
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
    else {
        res.status(500).send("No such tourney of id " + req.params.id);
    }
}));
//Start server
app.listen(port, () => {
    console.log("Server is running on port " + port);
});
