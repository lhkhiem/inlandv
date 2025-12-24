import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class TrackingScript extends Model {
  public id!: string;
  public name!: string;
  public type!: 'analytics' | 'pixel' | 'custom' | 'tag-manager' | 'heatmap' | 'live-chat';
  public provider?: string;
  public position!: 'head' | 'body';
  public script_code!: string;
  public is_active!: boolean;
  public load_strategy!: 'sync' | 'async' | 'defer';
  public pages!: string[];
  public priority!: number;
  public description?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

TrackingScript.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'custom',
    },
    provider: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    position: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'head',
    },
    script_code: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    load_strategy: {
      type: DataTypes.STRING(20),
      defaultValue: 'sync',
    },
    pages: {
      type: DataTypes.JSONB,
      defaultValue: ['all'],
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    description: {
      type: DataTypes.TEXT,
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
    tableName: 'tracking_scripts',
    timestamps: false,
  }
);

export default TrackingScript;






