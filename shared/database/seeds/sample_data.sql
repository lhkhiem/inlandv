-- Seed Data
-- Sample data for development and testing

-- Insert sample projects
INSERT INTO projects (title, slug, description, location, price_min, price_max, area_min, area_max, status, thumbnail_url, gallery) VALUES
('Vinhomes Grand Park', 'vinhomes-grand-park', 'Đô thị thông minh đẳng cấp quốc tế với đầy đủ tiện ích', 'Quận 9, TP. HCM', 2000000000, 5000000000, 50, 120, 'dang-mo-ban', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=800', '["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800"]'),
('Masteri Lumiere Riverside', 'masteri-lumiere-riverside', 'Căn hộ cao cấp bên bờ sông Sài Gòn', 'Quận 2, TP. HCM', 3000000000, 6000000000, 60, 150, 'dang-mo-ban', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800', '[]'),
('The Sycamore', 'the-sycamore', 'Biệt thự sinh thái trong lòng thành phố', 'Quận 7, TP. HCM', 10000000000, 20000000000, 200, 500, 'sap-mo-ban', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800', '[]')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample posts
INSERT INTO posts (title, slug, category, thumbnail_url, content) VALUES
('Thị trường bất động sản TP.HCM quý 1/2024', 'thi-truong-bat-dong-san-tphcm-quy-1-2024', 'Tin thị trường', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800', 'Phân tích xu hướng và biến động giá bất động sản...'),
('Hướng dẫn thủ tục mua bán nhà đất', 'huong-dan-thu-tuc-mua-ban-nha-dat', 'Kiến thức', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=800', 'Tổng hợp đầy đủ các bước và giấy tờ cần thiết...'),
('Top 10 dự án căn hộ đáng đầu tư 2024', 'top-10-du-an-can-ho-dang-dau-tu-2024', 'Đầu tư', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=800', 'Danh sách các dự án có tiềm năng sinh lời cao...')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample jobs
INSERT INTO jobs (title, slug, location, salary_range, description, requirements) VALUES
('Giám đốc Kinh doanh', 'giam-doc-kinh-doanh', 'TP. Hồ Chí Minh', 'Thỏa thuận', 'Quản lý và phát triển đội ngũ kinh doanh', 'Kinh nghiệm 5+ năm trong lĩnh vực BĐS'),
('Chuyên viên Pháp lý Dự án', 'chuyen-vien-phap-ly-du-an', 'TP. Hồ Chí Minh', '15-25 triệu', 'Thẩm định pháp lý các dự án BĐS', 'Tốt nghiệp Luật, am hiểu pháp luật BĐS')
ON CONFLICT (slug) DO NOTHING;

