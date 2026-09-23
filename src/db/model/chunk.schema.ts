import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";

import { sequelize } from "../dbConnect.js";
export interface ChunkInterface {
  id: number,
  document_id: string,
  chunk_index: number,
  content: string,
  embedding:number[],
  createdAt: Date,
  updatedAt:Date
}
class Chunk extends Model<
  InferAttributes<Chunk, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<Chunk>
> {
  declare id: CreationOptional<string>;
  declare document_id: string;
  declare chunk_index: number;
  declare content: string;
  declare embedding: number[];
  declare metadata: Record<string, unknown> | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Chunk.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    document_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "documents",
        key: "id",
      },
    },

    chunk_index: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    embedding: {
      type: "VECTOR(3072)",
      allowNull: false,
    },

    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "chunks",
    timestamps: true,
    underscored: true,
  }
);

export default Chunk;