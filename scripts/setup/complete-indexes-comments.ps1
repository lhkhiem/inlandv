# Complete Indexes and Comments
# Tạo indexes và comments còn thiếu sau khi fix ownership

param(
    [string]$DbName = "inlandv_realestate"
)

$ErrorActionPreference = "Stop"

Write-Host "[FIX] Completing indexes and comments..." -ForegroundColor Cyan
Write-Host ""

$env:PGPASSWORD = "EKYvccPcharP"

try {
    Write-Host "[STEP 1] Creating missing indexes..." -ForegroundColor Yellow
    
    # Settings indexes
    psql -U inlandv_user -d $DbName -c "CREATE INDEX IF NOT EXISTS idx_settings_namespace ON settings(namespace);" 2>&1 | Out-Null
    
    # Menu indexes
    psql -U inlandv_user -d $DbName -c "CREATE INDEX IF NOT EXISTS idx_menu_locations_slug ON menu_locations(slug);" 2>&1 | Out-Null
    psql -U inlandv_user -d $DbName -c "CREATE INDEX IF NOT EXISTS idx_menu_items_location_id ON menu_items(location_id);" 2>&1 | Out-Null
    psql -U inlandv_user -d $DbName -c "CREATE INDEX IF NOT EXISTS idx_menu_items_parent_id ON menu_items(parent_id);" 2>&1 | Out-Null
    psql -U inlandv_user -d $DbName -c "CREATE INDEX IF NOT EXISTS idx_menu_items_order ON menu_items(location_id, \"order\");" 2>&1 | Out-Null
    
    # Page metadata indexes
    psql -U inlandv_user -d $DbName -c "CREATE INDEX IF NOT EXISTS idx_page_metadata_path ON page_metadata(path);" 2>&1 | Out-Null
    
    # Activity logs indexes
    psql -U inlandv_user -d $DbName -c "CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);" 2>&1 | Out-Null
    psql -U inlandv_user -d $DbName -c "CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);" 2>&1 | Out-Null
    psql -U inlandv_user -d $DbName -c "CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);" 2>&1 | Out-Null
    
    # Assets indexes
    psql -U inlandv_user -d $DbName -c "CREATE INDEX IF NOT EXISTS idx_assets_folder_id ON assets(folder_id);" 2>&1 | Out-Null
    psql -U inlandv_user -d $DbName -c "CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);" 2>&1 | Out-Null
    psql -U inlandv_user -d $DbName -c "CREATE INDEX IF NOT EXISTS idx_assets_created_at ON assets(created_at);" 2>&1 | Out-Null
    
    # FAQ indexes
    psql -U inlandv_user -d $DbName -c "CREATE INDEX IF NOT EXISTS idx_faq_categories_slug ON faq_categories(slug);" 2>&1 | Out-Null
    psql -U inlandv_user -d $DbName -c "CREATE INDEX IF NOT EXISTS idx_faq_questions_category_id ON faq_questions(category_id);" 2>&1 | Out-Null
    psql -U inlandv_user -d $DbName -c "CREATE INDEX IF NOT EXISTS idx_faq_questions_order ON faq_questions(category_id, \"order\");" 2>&1 | Out-Null
    
    # Tracking scripts indexes
    psql -U inlandv_user -d $DbName -c "CREATE INDEX IF NOT EXISTS idx_tracking_scripts_active ON tracking_scripts(is_active);" 2>&1 | Out-Null
    psql -U inlandv_user -d $DbName -c "CREATE INDEX IF NOT EXISTS idx_tracking_scripts_position ON tracking_scripts(position);" 2>&1 | Out-Null
    psql -U inlandv_user -d $DbName -c "CREATE INDEX IF NOT EXISTS idx_tracking_scripts_priority ON tracking_scripts(priority);" 2>&1 | Out-Null
    
    # Newsletter indexes
    psql -U inlandv_user -d $DbName -c "CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_email ON newsletter_subscriptions(email);" 2>&1 | Out-Null
    psql -U inlandv_user -d $DbName -c "CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_status ON newsletter_subscriptions(status);" 2>&1 | Out-Null
    psql -U inlandv_user -d $DbName -c "CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_created_at ON newsletter_subscriptions(created_at);" 2>&1 | Out-Null
    
    Write-Host "[OK] Indexes created" -ForegroundColor Green

    Write-Host ""
    Write-Host "[STEP 2] Adding table comments..." -ForegroundColor Yellow
    
    # Add comments (skip if already exist)
    psql -U inlandv_user -d $DbName -c "COMMENT ON TABLE settings IS 'CMS settings with namespace-based organization';" 2>&1 | Out-Null
    psql -U inlandv_user -d $DbName -c "COMMENT ON TABLE menu_locations IS 'Menu locations (header, footer, sidebar)';" 2>&1 | Out-Null
    psql -U inlandv_user -d $DbName -d $DbName -c "COMMENT ON TABLE menu_items IS 'Menu items with hierarchical structure';" 2>&1 | Out-Null
    psql -U inlandv_user -d $DbName -c "COMMENT ON TABLE page_metadata IS 'SEO metadata for pages';" 2>&1 | Out-Null
    psql -U inlandv_user -d $DbName -c "COMMENT ON TABLE activity_logs IS 'User activity logs';" 2>&1 | Out-Null
    psql -U inlandv_user -d $DbName -c "COMMENT ON TABLE assets IS 'Media assets (images, files)';" 2>&1 | Out-Null
    psql -U inlandv_user -d $DbName -c "COMMENT ON TABLE faq_categories IS 'FAQ categories';" 2>&1 | Out-Null
    psql -U inlandv_user -d $DbName -c "COMMENT ON TABLE faq_questions IS 'FAQ questions and answers';" 2>&1 | Out-Null
    psql -U inlandv_user -d $DbName -c "COMMENT ON TABLE tracking_scripts IS 'Tracking scripts management';" 2>&1 | Out-Null
    psql -U inlandv_user -d $DbName -c "COMMENT ON TABLE newsletter_subscriptions IS 'Newsletter subscriptions';" 2>&1 | Out-Null
    
    Write-Host "[OK] Comments added" -ForegroundColor Green

    Write-Host ""
    Write-Host "[SUCCESS] Indexes and comments completed!" -ForegroundColor Green

} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    $env:PGPASSWORD = $null
}





