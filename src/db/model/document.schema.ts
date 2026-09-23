import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";

import { sequelize } from "../dbConnect.js";
export interface DocumentInterface {
  id: number,
  filename: string,
  doc_path?: string,
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date
}
class Document extends Model<
  InferAttributes<
    Document,
    { omit: "createdAt" | "updatedAt" | "deletedAt" }
  >,
  InferCreationAttributes<Document>
> {
  declare id: CreationOptional<string>;
  declare filename: string;

  declare doc_path: string | null;

  declare createdAt: CreationOptional<Date>;

  declare updatedAt: CreationOptional<Date>;

  declare deletedAt: Date | null;
}

Document.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    doc_path: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },

  {
    sequelize,
    tableName: "documents",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

export default Document;