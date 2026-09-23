import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";

import { sequelize } from "../dbConnect.js";
export interface ConversationDocumnet{
conversation_id:string,
document_id:string,
createdAt:Date,
updatedAt:Date,
deletedAt:Date
}
class ConversationDocument extends Model<
  InferAttributes<
    ConversationDocument,
    { omit: "createdAt" | "updatedAt" }
  >,
  InferCreationAttributes<ConversationDocument>
> {
  declare conversation_id: string;

  declare document_id: string;

  declare createdAt: CreationOptional<Date>;

  declare updatedAt: CreationOptional<Date>;
}

ConversationDocument.init(
  {
    conversation_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "conversations",
        key: "id",
      },
    },

    document_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "documents",
        key: "id",
      },
    },
  },
  {
    sequelize,
    tableName: "conversation_documents",
    paranoid: true,
    timestamps: true,
    underscored: true,
  }
);

export default ConversationDocument;