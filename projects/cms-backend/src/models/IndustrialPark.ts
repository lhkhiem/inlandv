// Model IndustrialPark
// - Lưu thông tin khu công nghiệp
// - Schema theo database-schema-final.md

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class IndustrialPark extends Model {
  public id!: string;
  public code!: string;
  public name!: string;
  public slug!: string;
  public scope!: 'trong-kcn' | 'ngoai-kcn';
  public has_rental!: boolean;
  public has_transfer!: boolean;
  public province!: string;
  public district?: string;
  public address?: string;
  public latitude?: number;
  public longitude?: number;
  public google_maps_link?: string;
  public total_area!: number;
  public available_area?: number;
  public rental_price_min?: number;
  public rental_price_max?: number;
  public transfer_price_min?: number;
  public transfer_price_max?: number;
  public infrastructure?: Record<string, any>;
  public allowed_industries?: string[];
  public description?: string;
  public description_full?: string;
  public thumbnail_url?: string;
  public meta_title?: string;
  public meta_description?: string;
  public published_at?: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

IndustrialPark.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    scope: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['trong-kcn', 'ngoai-kcn']],
      },
    },
    has_rental: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    has_transfer: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    province: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    district: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    google_maps_link: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    total_area: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    available_area: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    rental_price_min: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    rental_price_max: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    transfer_price_min: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    transfer_price_max: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    infrastructure: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    allowed_industries: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    description_full: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    thumbnail_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    meta_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    meta_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'industrial_parks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default IndustrialPark;




















