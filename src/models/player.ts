import { DataTypes, Model, Op } from "sequelize"
import { Match } from "./match"
import { Tourney } from "./tourney"
import sequelize from "../database"

export class Player extends Model {
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