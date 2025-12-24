-- Fix triggers by creating the function first
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate triggers
DROP TRIGGER IF EXISTS trigger_settings_updated_at ON settings;
CREATE TRIGGER trigger_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_menu_locations_updated_at ON menu_locations;
CREATE TRIGGER trigger_menu_locations_updated_at
  BEFORE UPDATE ON menu_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_menu_items_updated_at ON menu_items;
CREATE TRIGGER trigger_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_page_metadata_updated_at ON page_metadata;
CREATE TRIGGER trigger_page_metadata_updated_at
  BEFORE UPDATE ON page_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_asset_folders_updated_at ON asset_folders;
CREATE TRIGGER trigger_asset_folders_updated_at
  BEFORE UPDATE ON asset_folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_assets_updated_at ON assets;
CREATE TRIGGER trigger_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_faq_categories_updated_at ON faq_categories;
CREATE TRIGGER trigger_faq_categories_updated_at
  BEFORE UPDATE ON faq_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_faq_questions_updated_at ON faq_questions;
CREATE TRIGGER trigger_faq_questions_updated_at
  BEFORE UPDATE ON faq_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_tracking_scripts_updated_at ON tracking_scripts;
CREATE TRIGGER trigger_tracking_scripts_updated_at
  BEFORE UPDATE ON tracking_scripts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_newsletter_subscriptions_updated_at ON newsletter_subscriptions;
CREATE TRIGGER trigger_newsletter_subscriptions_updated_at
  BEFORE UPDATE ON newsletter_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();





