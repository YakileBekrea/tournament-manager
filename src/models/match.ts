import { DataTypes, Model } from "sequelize"
import sequelize from "../database"
import { Tourney } from "./tourney"

export class Match extends Model {
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

Match.belongsTo(Tourney, {
    foreignKey: 'tourneyId'
})