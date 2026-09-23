import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();
class Database { 
     sequelize;
    constructor() {
        this.sequelize = new Sequelize({
            dialect: "postgres",
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });
    }  
    
     async connect() {
        try {
            await this.sequelize.authenticate();
            console.log("Database connection established successfully.");
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }

     getSequelizeInstance() {
        return this.sequelize;
    }
}

export const db=new Database()
export const sequelize = db.getSequelizeInstance()