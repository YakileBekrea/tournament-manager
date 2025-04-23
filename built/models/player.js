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
exports.Player = void 0;
const sequelize_1 = require("sequelize");
const match_1 = require("./match");
const tourney_1 = require("./tourney");
const database_1 = __importDefault(require("../database"));
class Player extends sequelize_1.Model {
    getWinPercentageMatches() {
        return __awaiter(this, void 0, void 0, function* () {
            var resultString = "";
            const won = yield match_1.Match.count({
                where: {
                    winnerId: this.id
                }
            });
            //Get both player1 and player 2 id matches.
            const participated = (yield match_1.Match.count({
                where: {
                    player1Id: this.id,
                    //Exclude incomplete matches
                    winnerId: {
                        [sequelize_1.Op.not]: null
                    }
                }
            })) + (yield match_1.Match.count({
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
            const won = yield match_1.Match.count({
                where: {
                    winnerId: this.id
                }
            });
            return won;
        });
    }
    getWonTournaments() {
        return __awaiter(this, void 0, void 0, function* () {
            const won = yield tourney_1.Tourney.count({
                where: {
                    winnerId: this.id
                }
            });
            return won;
        });
    }
}
exports.Player = Player;
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
    sequelize: database_1.default,
    modelName: 'Player'
});
