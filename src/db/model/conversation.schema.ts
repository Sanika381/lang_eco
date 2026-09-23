import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyGetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyCreateAssociationMixin,
} from "sequelize";

import { sequelize } from "../dbConnect.js";
import Message from "./message.schema.js";
export interface ConversationInterface {
  id: number,
  title: string,
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date
}


class Conversation extends Model<
  InferAttributes<Conversation, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<Conversation>
> {
  declare id: CreationOptional<string>;

  declare title: string;

  declare createdAt: CreationOptional<Date>;

  declare updatedAt: CreationOptional<Date>;
  declare addDocuments: BelongsToManyAddAssociationsMixin<
    Document,
    string
  >;

  declare getDocuments: BelongsToManyGetAssociationsMixin<Document>;
  declare createMessage: HasManyCreateAssociationMixin<Message>;
  declare addMessage: HasManyAddAssociationMixin< string,Message>;
  declare getMessages: HasManyGetAssociationsMixin<Message>;
}

Conversation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "conversations",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

export default Conversation;