"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tourney = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../database"));
class Tourney extends sequelize_1.Model {
}
exports.Tourney = Tourney;
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
    sequelize: database_1.default,
    modelName: 'Tourney',
    timestamps: true
});
