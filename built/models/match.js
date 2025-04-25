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
exports.Match = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../database"));
const tourney_1 = require("./tourney");
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
exports.Match = Match;
Match.init({
    matchId: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nextMatch: {
        type: sequelize_1.DataTypes.INTEGER
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
    }
}, {
    hooks: {
        afterUpdate: (match, options) => __awaiter(void 0, void 0, void 0, function* () {
            if (match.winnerId !== null) {
                var updater = yield Match.findByPk(match.nextMatch);
                if (updater !== null) {
                    console.log("Updater was not null.");
                    if (updater.player1Id !== null) {
                        console.log("player1Id was not null");
                        if (updater.player2Id !== null) {
                            console.log("Tried updating " + updater.matchId + " but both player slots are full!");
                        }
                        else {
                            console.log("player2Id slot filled.");
                            updater.player2Id = match.winnerId;
                        }
                    }
                    else {
                        console.log("player2Id slot filled.");
                        updater.player1Id = match.winnerId;
                    }
                }
                updater === null || updater === void 0 ? void 0 : updater.save();
            }
        })
    },
    sequelize: database_1.default,
    modelName: 'Match',
    timestamps: true
});
Match.belongsTo(tourney_1.Tourney, {
    foreignKey: 'tourneyId'
});
