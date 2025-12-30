import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class PageMetadata extends Model {
  public id!: string;
  public path!: string;
  public title?: string;
  public description?: string;
  public og_image?: string;
  public keywords?: string[];
  public enabled!: boolean;
  public auto_generated!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

PageMetadata.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    path: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    og_image: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    keywords: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    auto_generated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    tableName: 'page_metadata',
    timestamps: false,
  }
);

export default PageMetadata;






















