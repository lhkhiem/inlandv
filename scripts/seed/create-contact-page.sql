-- Create Contact page with sections
-- Date: 2025-01-28
-- Source: https://inlandv-demo.pressup.vn/lien-he

-- Insert Contact page
INSERT INTO pages (id, slug, title, page_type, published, meta_title, meta_description, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'lien-he',
  'Liên hệ',
  'static',
  true,
  'Liên hệ - Inland Real Estate',
  'Liên hệ với INLANDV để được tư vấn về bất động sản công nghiệp và thương mại',
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING
RETURNING id;

-- Insert sections for Contact page
DO $$
DECLARE
  contact_page_id UUID;
BEGIN
  SELECT id INTO contact_page_id FROM pages WHERE slug = 'lien-he';
  
  IF contact_page_id IS NOT NULL THEN
    -- 1. Hero Section
    INSERT INTO page_sections (id, page_id, section_key, name, section_type, display_order, content, images, published, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      contact_page_id,
      'hero',
      'Hero Section',
      'hero',
      0,
      '<div class="hero-content">
        <p class="hero-label">LIÊN HỆ VỚI CHÚNG TÔI</p>
        <h1>INLANDV luôn sẵn sàng lắng nghe và mang đến giải pháp bất động sản tối ưu cho nhu cầu của bạn.</h1>
        <p class="hero-description">Chỉ cần điền thông tin bên dưới, đội ngũ INLANDV sẽ nhanh chóng kết nối và tư vấn cho bạn dự án phù hợp nhất.</p>
      </div>',
      ARRAY[]::TEXT[],
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (page_id, section_key) DO UPDATE
    SET 
      name = EXCLUDED.name,
      content = EXCLUDED.content,
      updated_at = NOW();

    -- 2. Contact Information Section
    INSERT INTO page_sections (id, page_id, section_key, name, section_type, display_order, content, images, published, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      contact_page_id,
      'thong-tin',
      'Thông tin liên hệ',
      'info',
      1,
      '<div class="contact-info-content">
        <div class="info-header">
          <h2>Thông tin liên hệ</h2>
          <p>Hãy để chúng tôi giúp bạn tìm kiếm cơ hội bất động sản hoàn hảo</p>
        </div>
        <div class="contact-details">
          <div class="contact-item">
            <div class="contact-icon">📍</div>
            <h3>Địa chỉ</h3>
            <p>Tầng 12, Tòa nhà ABC, 123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
          </div>
          <div class="contact-item">
            <div class="contact-icon">📞</div>
            <h3>Hotline</h3>
            <p><a href="tel:0896686645">0896 686 645</a></p>
          </div>
          <div class="contact-item">
            <div class="contact-icon">✉️</div>
            <h3>Email</h3>
            <p><a href="mailto:property.inlandv@gmail.com">property.inlandv@gmail.com</a></p>
          </div>
        </div>
        <div class="map-section">
          <h3>Bản đồ dẫn đường</h3>
          <div class="map-container">
            <iframe 
              src="https://www.openstreetmap.org/export/embed.html?bbox=106.6909%2C10.7669%2C106.7109%2C10.7869&layer=mapnik&marker=10.7769,106.7009" 
              width="100%" 
              height="400" 
              frameborder="0" 
              style="border:0"
              allowfullscreen>
            </iframe>
            <p class="map-link">
              <a href="https://www.openstreetmap.org/?mlat=10.7769&mlon=106.7009#map=15/10.7769/106.7009" target="_blank" rel="noopener noreferrer">
                Xem bản đồ lớn hơn
              </a>
            </p>
          </div>
        </div>
      </div>',
      ARRAY[]::TEXT[],
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (page_id, section_key) DO UPDATE
    SET 
      name = EXCLUDED.name,
      content = EXCLUDED.content,
      updated_at = NOW();

    -- 3. Contact Form Section
    INSERT INTO page_sections (id, page_id, section_key, name, section_type, display_order, content, images, published, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      contact_page_id,
      'form-lien-he',
      'Form liên hệ',
      'form',
      2,
      '<div class="contact-form-content">
        <div class="form-header">
          <h2>Để lại thông tin</h2>
          <p>Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất</p>
        </div>
        <form class="contact-form" id="contactForm" action="/api/contact" method="POST">
          <div class="form-row">
            <div class="form-group">
              <label for="full_name">Họ và tên <span class="required">*</span></label>
              <input 
                type="text" 
                id="full_name" 
                name="full_name" 
                placeholder="Nguyễn Văn A" 
                required
              />
            </div>
            <div class="form-group">
              <label for="phone">Số điện thoại <span class="required">*</span></label>
              <input 
                type="tel" 
                id="phone" 
                name="phone" 
                placeholder="0901234567" 
                required
              />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="email">Email <span class="required">*</span></label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="example@email.com" 
                required
              />
            </div>
            <div class="form-group">
              <label for="service">Dịch vụ cần tư vấn <span class="required">*</span></label>
              <select id="service" name="service" required>
                <option value="" disabled selected>Chọn dịch vụ</option>
                <option value="mua-ban">Mua/Bán Bất động sản</option>
                <option value="thue-cho-thue">Thuê/Cho thuê Bất động sản</option>
                <option value="tu-van-khac">Tư vấn khác</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label for="message">Lời nhắn</label>
            <textarea 
              id="message" 
              name="message" 
              rows="5" 
              placeholder="Để lại lời nhắn cho chúng tôi"
            ></textarea>
          </div>
          <button type="submit" class="submit-btn">
            <span>Gửi yêu cầu tư vấn</span>
          </button>
        </form>
      </div>',
      ARRAY[]::TEXT[],
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (page_id, section_key) DO UPDATE
    SET 
      name = EXCLUDED.name,
      content = EXCLUDED.content,
      updated_at = NOW();

    RAISE NOTICE 'Contact page and sections created successfully';
  ELSE
    RAISE NOTICE 'Contact page not found';
  END IF;
END $$;


