import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";

import { sequelize } from "../dbConnect.js";
export interface MessageInterface{
  id:number,
  conversation_id:string,
  role:string,
  content:string,
  createdAt:Date,
  updatedAt:Date,
  deletedAt:Date
}
class Message extends Model<
  InferAttributes<Message, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<Message>
> {
  declare id: CreationOptional<number>;

  declare conversation_id: CreationOptional<string>;

  declare role: string;

  declare content: string | null;

  declare createdAt: CreationOptional<Date>;

  declare updatedAt: CreationOptional<Date>;
}

Message.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    conversation_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "conversations",
        key: "id",
      },
    },

    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "messages",
    paranoid: true,
    timestamps: true,
    underscored: true,
  }
);

export default Message;