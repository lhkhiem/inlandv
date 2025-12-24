import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AssetFolderAttributes {
  id: string;
  name: string;
  parent_id?: string | null;
  path?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

interface AssetFolderCreationAttributes extends Optional<AssetFolderAttributes, 'id' | 'created_at' | 'updated_at' | 'parent_id' | 'path'> {}

class AssetFolder extends Model<AssetFolderAttributes, AssetFolderCreationAttributes> implements AssetFolderAttributes {
  public id!: string;
  public name!: string;
  public parent_id?: string | null;
  public path?: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

AssetFolder.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parent_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'asset_folders',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    path: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'asset_folders',
    timestamps: false,
  }
);

export default AssetFolder;
