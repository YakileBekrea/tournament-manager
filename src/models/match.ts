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
    public nextMatch!: number
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
        nextMatch: {
            type: DataTypes.INTEGER
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
        }
    },
    {
        hooks:
        {
            afterUpdate: async (match, options) => {

                if (match.winnerId !== null)
                {
                    var updater = await Match.findByPk(match.nextMatch)
                    if (updater !== null)
                    {
                        console.log("Updater was not null.")
                        if (updater.player1Id !== null)
                        {
                            console.log("player1Id was not null")
                            if (updater.player2Id !== null)
                            {
                                console.log("Tried updating " + updater.matchId + " but both player slots are full!")
                            }
                            else
                            {
                                console.log("player2Id slot filled.")
                                updater.player2Id = match.winnerId
                            }
                        }
                        else
                        {
                            console.log("player2Id slot filled.")
                            updater.player1Id = match.winnerId
                        }
                    }
                    updater?.save()
                }
            }
        },
        sequelize,
        modelName: 'Match',
        timestamps: true
    }
)

Match.belongsTo(Tourney, {
    foreignKey: 'tourneyId'
})