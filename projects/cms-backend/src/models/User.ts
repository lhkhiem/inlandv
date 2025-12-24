// Model User 
// - Lưu thông tin người dùng: email, password hash, name, role
// - Schema: id, email, password_hash, name, role, first_name, created_at
// - Có quan hệ One-to-Many với Post (author)

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class User extends Model {
  public id!: string;           // UUID, primary key
  public email!: string;        // Email, unique
  public password_hash!: string; // Mật khẩu đã hash
  public name!: string;         // Tên hiển thị
  public role!: string;         // owner/admin/editor/author/sale
  public first_name?: string;   // Tên (optional)
  public readonly created_at!: Date;
}

User.init(
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
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'sale',
    },
    first_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: false,
  }
);

export default User;




