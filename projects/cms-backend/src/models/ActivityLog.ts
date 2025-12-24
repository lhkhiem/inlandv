import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class ActivityLog extends Model {
  public id!: string;
  public user_id?: string;
  public action!: string;
  public entity_type!: string;
  public entity_id?: string;
  public entity_name?: string;
  public description?: string;
  public metadata?: Record<string, any>;
  public ip_address?: string;
  public user_agent?: string;
  public readonly created_at!: Date;
}

ActivityLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    entity_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    entity_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    entity_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'activity_logs',
    timestamps: false,
  }
);

export default ActivityLog;






