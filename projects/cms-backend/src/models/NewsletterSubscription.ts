import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class NewsletterSubscription extends Model {
  public id!: string;
  public email!: string;
  public status!: 'active' | 'unsubscribed' | 'bounced';
  public subscribed_at!: Date;
  public unsubscribed_at?: Date;
  public source?: string;
  public ip_address?: string;
  public user_agent?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

NewsletterSubscription.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'active',
    },
    subscribed_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    unsubscribed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    source: {
      type: DataTypes.STRING(255),
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
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'newsletter_subscriptions',
    timestamps: false,
  }
);

export default NewsletterSubscription;






















