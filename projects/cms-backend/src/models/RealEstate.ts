// Model RealEstate
// - Lưu thông tin bất động sản
// - Schema theo database-schema-final.md

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class RealEstate extends Model {
  public id!: string;
  public code!: string;
  public name!: string;
  public slug!: string;
  public province!: string;
  public district?: string;
  public ward?: string;
  public street?: string;
  public address?: string;
  public latitude?: number;
  public longitude?: number;
  public type!: 'nha-pho' | 'can-ho' | 'dat-nen' | 'biet-thu' | 'shophouse' | 'nha-xuong';
  public category?: string;
  public status!: 'available' | 'sold' | 'reserved';
  public legal_status?: string;
  public area!: number;
  public land_area?: number;
  public construction_area?: number;
  public width?: number;
  public length?: number;
  public bedrooms?: number;
  public bathrooms?: number;
  public floors?: number;
  public orientation?: string;
  public has_rental!: boolean;
  public has_transfer!: boolean;
  public sale_price?: number;
  public sale_price_min?: number;
  public sale_price_max?: number;
  public sale_price_per_sqm?: number;
  public rental_price?: number;
  public rental_price_min?: number;
  public rental_price_max?: number;
  public rental_price_per_sqm?: number;
  public price?: number; // Deprecated - use sale_price or rental_price
  public price_per_sqm?: number; // Deprecated
  public negotiable!: boolean;
  public furniture?: 'full' | 'basic' | 'empty';
  public description?: string;
  public description_full?: string;
  public thumbnail_url?: string;
  public video_url?: string;
  public contact_name?: string;
  public contact_phone?: string;
  public contact_email?: string;
  public meta_title?: string;
  public meta_description?: string;
  public meta_keywords?: string;
  public published_at?: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

RealEstate.init(
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
    province: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    district: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    ward: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    street: {
      type: DataTypes.STRING(255),
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
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['nha-pho', 'can-ho', 'dat-nen', 'biet-thu', 'shophouse', 'nha-xuong']],
      },
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'available',
      validate: {
        isIn: [['available', 'sold', 'reserved']],
      },
    },
    legal_status: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    area: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    land_area: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    construction_area: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    width: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    length: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    bedrooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    bathrooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    floors: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    orientation: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    has_rental: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    has_transfer: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    sale_price: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    sale_price_min: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    sale_price_max: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    sale_price_per_sqm: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    rental_price: {
      type: DataTypes.BIGINT,
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
    rental_price_per_sqm: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    price: {
      type: DataTypes.BIGINT,
      allowNull: true, // Deprecated - kept for backward compatibility
    },
    price_per_sqm: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    negotiable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    furniture: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        isIn: [['full', 'basic', 'empty']],
      },
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
    video_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    contact_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    contact_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    contact_email: {
      type: DataTypes.STRING(255),
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
    meta_keywords: {
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
    tableName: 'properties',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default RealEstate;


