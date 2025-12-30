-- Migration 057: Insert about page (gioi-thieu) with all sections
-- Date: 2025-01-28
-- Inserts sample data for the about page with all hardcoded content

-- Insert page
INSERT INTO pages (slug, title, page_type, published, meta_title, meta_description)
VALUES (
  'gioi-thieu',
  'Giới thiệu',
  'static',
  true,
  'Giới thiệu - Inland Real Estate',
  'Tìm hiểu về Inland Real Estate - Sàn giao dịch bất động sản uy tín với hơn 15 năm kinh nghiệm'
)
ON CONFLICT (slug) DO UPDATE
SET 
  title = EXCLUDED.title,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  updated_at = CURRENT_TIMESTAMP
RETURNING id;

-- Get page_id (will be used in subsequent inserts)
DO $$
DECLARE
  page_id_var UUID;
BEGIN
  SELECT id INTO page_id_var FROM pages WHERE slug = 'gioi-thieu';
  
  -- Section 1: Hero
  INSERT INTO page_sections (page_id, section_key, name, section_type, display_order, content, images, published)
  VALUES (
    page_id_var,
    'hero',
    'Mở đầu',
    'hero',
    0,
    '{"logo": "/logo-1.png", "description": "Với hơn 15 năm kinh nghiệm trong lĩnh vực bất động sản, chúng tôi tự hào là đối tác đáng tin cậy của hàng nghìn khách hàng trên khắp cả nước. Sự hài lòng của bạn chính là thành công của chúng tôi.", "stats": [{"value": 15, "suffix": "+", "label": "Năm Kinh Nghiệm"}, {"value": 200, "suffix": "+", "label": "Dự Án"}, {"value": 5000, "suffix": "+", "label": "Khách Hàng"}, {"value": 50, "suffix": "+", "label": "Đối Tác"}], "backgroundImage": "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=2000&q=80"}',
    ARRAY['https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=2000&q=80'],
    true
  )
  ON CONFLICT (page_id, section_key) DO UPDATE
  SET 
    name = EXCLUDED.name,
    content = EXCLUDED.content,
    images = EXCLUDED.images,
    updated_at = CURRENT_TIMESTAMP;

  -- Section 2: Story Origin
  INSERT INTO page_sections (page_id, section_key, name, section_type, display_order, content, published)
  VALUES (
    page_id_var,
    'cau-chuyen',
    'Câu chuyện Inlandv',
    'content',
    1,
    '{"paragraphs": ["INLANDV được chính thức thành lập vào năm 2022, được quản lý bởi Hội đồng quản trị với hơn 15 năm kinh nghiệm trong lĩnh vực bất động sản. Chúng tôi nhanh chóng thiết lập vị thế trong Bất động sản Công nghiệp - Thương mại, cung cấp giải pháp toàn diện cho việc thuê kho, đất công nghiệp và tòa nhà văn phòng tại TP.HCM và các tỉnh trọng điểm như Long An, Bình Dương, Bình Phước và Tây Ninh.", "Mạng lưới đối tác chiến lược của chúng tôi, với những người mà chúng tôi hợp tác để cung cấp giải pháp bất động sản được điều chỉnh cho sự phát triển sản xuất và kinh doanh. Một số đối tác đáng chú ý: Công ty Vật Liệu Hút Chân Không Cách Nhiệt, Khách Sạn Huazhu, Dự Án Eaton Park, và Global City.", "Với kinh nghiệm thực tế và khả năng đã được chứng minh, INLANDV sẵn sàng hợp tác với khách hàng để tạo ra giá trị lâu dài và thúc đẩy thành công bền vững."], "vision": {"title": "Tầm nhìn", "content": "INLANDV hướng đến vị thế dẫn đầu trong lĩnh vực Bất động sản, đặc biệt là bất động sản công nghiệp, đồng thời xây dựng hệ sinh thái bất động sản đột phá và bền vững."}, "mission": {"title": "Sứ mệnh", "content": "INLANDV cam kết mang đến giải pháp bất động sản toàn diện, tối ưu chi phí – gia tăng giá trị đầu tư. Chúng tôi đồng hành cùng doanh nghiệp mở rộng kết nối toàn cầu, nâng cao vị thế trên thị trường quốc tế."}, "coreValues": {"title": "Giá trị cốt lõi", "content": "Tận tâm - Chuyên nghiệp - Minh bạch – Bền vững."}}',
    true
  )
  ON CONFLICT (page_id, section_key) DO UPDATE
  SET 
    name = EXCLUDED.name,
    content = EXCLUDED.content,
    updated_at = CURRENT_TIMESTAMP;

  -- Section 3: Key Team
  INSERT INTO page_sections (page_id, section_key, name, section_type, display_order, content, images, published)
  VALUES (
    page_id_var,
    'doi-ngu',
    'Đội ngũ lãnh đạo',
    'team',
    2,
    '{"members": [{"id": 1, "name": "Ms Lisa Nghia", "position": "CEO & Founder", "description": "Giới thiệu:...."}, {"id": 2, "name": "Ms Oanh Hoang", "position": "COO", "description": "Giới thiệu:...."}, {"id": 3, "name": "Ms Anna Tran", "position": "CFO", "description": "Giới thiệu:...."}, {"id": 4, "name": "Ms Sarah Le", "position": "CMO", "description": "Giới thiệu:...."}]}',
    ARRAY[
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=800&fit=crop&q=85',
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&h=800&fit=crop&q=85',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop&q=85',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop&q=85'
    ],
    true
  )
  ON CONFLICT (page_id, section_key) DO UPDATE
  SET 
    name = EXCLUDED.name,
    content = EXCLUDED.content,
    images = EXCLUDED.images,
    updated_at = CURRENT_TIMESTAMP;

  -- Section 4: Mission Vision (Tại sao nên chọn)
  INSERT INTO page_sections (page_id, section_key, name, section_type, display_order, content, images, published)
  VALUES (
    page_id_var,
    'tai-sao',
    'Tại sao nên chọn Inlandv',
    'info',
    3,
    '{"badge": "Uy tín & Chất lượng", "title": "Tại sao nên chọn Inlandv", "subtitle": "Những điểm mạnh tạo nên uy tín và sự tin cậy của INLANDV trong lĩnh vực bất động sản công nghiệp", "items": [{"icon": "Award", "title": "Kinh nghiệm dày dặn", "subtitle": "Hơn 15 năm trong lĩnh vực BĐS", "description": "Với hơn 15 năm kinh nghiệm trong lĩnh vực bất động sản công nghiệp, INLANDV đã tích lũy kiến thức sâu rộng về thị trường, quy trình và xu hướng đầu tư. Chúng tôi hiểu rõ từng chi tiết pháp lý, quy hoạch và thực tiễn triển khai dự án."}, {"icon": "Users", "title": "Đội ngũ chuyên nghiệp", "subtitle": "Chuyên gia hàng đầu", "description": "Đội ngũ của chúng tôi bao gồm các chuyên gia có trình độ cao, am hiểu sâu về bất động sản công nghiệp, pháp lý và đầu tư. Mỗi thành viên đều được đào tạo bài bản và có kinh nghiệm thực tế trong việc hỗ trợ các dự án FDI thành công."}, {"icon": "Network", "title": "Mạng lưới đối tác rộng lớn", "subtitle": "Kết nối toàn diện", "description": "INLANDV sở hữu mạng lưới đối tác chiến lược rộng khắp, từ các chủ đầu tư KCN uy tín, nhà cung cấp dịch vụ chuyên nghiệp đến các tổ chức tài chính. Mạng lưới này giúp chúng tôi cung cấp giải pháp toàn diện và tối ưu cho khách hàng."}, {"icon": "Shield", "title": "Cam kết minh bạch", "subtitle": "Uy tín được đảm bảo", "description": "Minh bạch trong mọi giao dịch là nguyên tắc hàng đầu của INLANDV. Chúng tôi cam kết cung cấp thông tin chính xác, rõ ràng và đầy đủ, đảm bảo khách hàng có đầy đủ cơ sở để đưa ra quyết định đầu tư đúng đắn."}], "backgroundImage": "/images/processed-image-12-13.webp"}',
    ARRAY['/images/processed-image-12-13.webp'],
    true
  )
  ON CONFLICT (page_id, section_key) DO UPDATE
  SET 
    name = EXCLUDED.name,
    content = EXCLUDED.content,
    images = EXCLUDED.images,
    updated_at = CURRENT_TIMESTAMP;

  -- Section 5: Key Clients
  INSERT INTO page_sections (page_id, section_key, name, section_type, display_order, content, images, published)
  VALUES (
    page_id_var,
    'khach-hang',
    'Khách hàng & Đối tác tiêu biểu',
    'clients',
    4,
    '{"badge": "Khách hàng & Đối tác", "title": "Khách hàng Tiêu biểu", "subtitle": "Hợp tác cùng các công ty FDI hàng đầu và KCN lớn trên toàn quốc", "stats": [{"icon": "Building2", "value": "50+", "label": "KCN hợp tác"}, {"icon": "Users", "value": "100+", "label": "Khách hàng FDI"}, {"icon": "Award", "value": "20+", "label": "Đối tác chiến lược"}, {"icon": "Star", "value": "98%", "label": "Hài lòng"}], "clients": [{"name": "Logo các công ty", "description": "Logo công ty FDI tiêu biểu", "projects": "15+"}, {"name": "Logo các KCN lớn", "description": "KCN đối tác tiêu biểu", "projects": "50+"}, {"name": "Đối tác thiết kế", "description": "Đối tác thi công & Xây dựng", "projects": "20+"}], "backgroundImage": "/images/PressUp - SOoMBKcIfH-2.webp", "footerNote": "* Logo các đối tác sẽ được cập nhật trong phiên bản chính thức"}',
    ARRAY['/images/PressUp - SOoMBKcIfH-2.webp'],
    true
  )
  ON CONFLICT (page_id, section_key) DO UPDATE
  SET 
    name = EXCLUDED.name,
    content = EXCLUDED.content,
    images = EXCLUDED.images,
    updated_at = CURRENT_TIMESTAMP;

END $$;

















