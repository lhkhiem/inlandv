// Initialize all models and their associations
import User from './User';
import MenuLocation from './MenuLocation';
import MenuItem from './MenuItem';
import sequelize from '../config/database';

// Menu associations
MenuLocation.hasMany(MenuItem, {
  foreignKey: 'menu_location_id',
  as: 'items',
});

MenuItem.belongsTo(MenuLocation, {
  foreignKey: 'menu_location_id',
  as: 'location',
});

MenuItem.hasMany(MenuItem, {
  foreignKey: 'parent_id',
  as: 'children',
});

MenuItem.belongsTo(MenuItem, {
  foreignKey: 'parent_id',
  as: 'parent',
});

// Export all models
export {
  User,
  MenuLocation,
  MenuItem,
};

