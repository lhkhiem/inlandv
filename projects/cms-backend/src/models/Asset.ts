import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Asset extends Model {
  public id!: string;
  public folder_id?: string;
  public type!: 'image' | 'video' | 'document' | 'audio' | 'other';
  public provider!: 'local' | 's3' | 'cloudinary' | 'cdn';
  public url!: string;
  public cdn_url?: string;
  public filename?: string;
  public mime_type?: string;
  public file_size?: number;
  public width?: number;
  public height?: number;
  public format?: string;
  public sizes?: Record<string, string>;
  public alt_text?: string;
  public caption?: string;
  public metadata?: Record<string, any>;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Asset.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    folder_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    provider: {
      type: DataTypes.STRING(50),
      defaultValue: 'local',
    },
    url: {
      type: DataTypes.STRING(1024),
      allowNull: false,
    },
    cdn_url: {
      type: DataTypes.STRING(1024),
      allowNull: true,
    },
    filename: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    mime_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    file_size: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    width: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    format: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    sizes: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    alt_text: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    caption: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
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
    tableName: 'assets',
    timestamps: false,
  }
);

export default Asset;






