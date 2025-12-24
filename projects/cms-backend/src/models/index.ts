// Initialize all models and their associations
import User from './User';
import MenuLocation from './MenuLocation';
import MenuItem from './MenuItem';
import Setting from './Setting';
import PageMetadata from './PageMetadata';
import ActivityLog from './ActivityLog';
import AssetFolder from './AssetFolder';
import Asset from './Asset';
import FAQCategory from './FAQCategory';
import FAQQuestion from './FAQQuestion';
import TrackingScript from './TrackingScript';
import NewsletterSubscription from './NewsletterSubscription';
import IndustrialPark from './IndustrialPark';
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

// Asset associations
AssetFolder.hasMany(AssetFolder, {
  foreignKey: 'parent_id',
  as: 'children',
});

AssetFolder.belongsTo(AssetFolder, {
  foreignKey: 'parent_id',
  as: 'parent',
});

AssetFolder.hasMany(Asset, {
  foreignKey: 'folder_id',
  as: 'assets',
});

Asset.belongsTo(AssetFolder, {
  foreignKey: 'folder_id',
  as: 'folder',
});

// FAQ associations
FAQCategory.hasMany(FAQQuestion, {
  foreignKey: 'category_id',
  as: 'questions',
});

FAQQuestion.belongsTo(FAQCategory, {
  foreignKey: 'category_id',
  as: 'category',
});

// Activity Log associations
ActivityLog.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// Export all models
export {
  User,
  MenuLocation,
  MenuItem,
  Setting,
  PageMetadata,
  ActivityLog,
  AssetFolder,
  Asset,
  FAQCategory,
  FAQQuestion,
  TrackingScript,
  NewsletterSubscription,
  IndustrialPark,
};

