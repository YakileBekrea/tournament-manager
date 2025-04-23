import { DataTypes, Model } from "sequelize"
import sequelize from "../database"

export class Tourney extends Model {
    public tourneyId!: number
    public winnerId!: number
    public eventName!: String
    public description!: String
    public readonly createdAt!: Date
    public readonly updatedAt!: Date
}

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