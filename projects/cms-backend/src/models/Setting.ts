import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Setting extends Model {
  public id!: string;
  public namespace!: string;
  public value!: Record<string, any>;
  public readonly updated_at!: Date;
}

Setting.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    namespace: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'settings',
    timestamps: false,
  }
);

export default Setting;






















