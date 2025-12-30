-- Update About page sections with proper div IDs matching demo site
-- Date: 2025-01-28
-- Sections: hero, cau-chuyen, doi-ngu, tai-sao, khach-hang

DO $$
DECLARE
  about_page_id UUID;
BEGIN
  SELECT id INTO about_page_id FROM pages WHERE slug = 'about';
  
  IF about_page_id IS NOT NULL THEN
    -- 1. Update Hero Section (id="hero")
    UPDATE page_sections
    SET 
      name = 'Hero Section',
      content = '<div id="hero" class="hero-section">
        <div class="hero-content">
          <div class="logo-container">
            <div class="logo-icon">
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 10H50V50H10V10Z" stroke="#00C853" stroke-width="2"/>
                <path d="M10 20H50M10 30H50M10 40H50" stroke="#00C853" stroke-width="1"/>
              </svg>
            </div>
            <h1 class="logo-text">INLANDV</h1>
            <p class="logo-subtitle">信缘房地产服务企业顾问</p>
          </div>
          <p class="hero-description">Với hơn 15 năm kinh nghiệm trong lĩnh vực bất động sản, chúng tôi tự hào là đối tác đáng tin cậy của hàng nghìn khách hàng trên khắp cả nước. Sự hài lòng của bạn chính là thành công của chúng tôi.</p>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">15+</div>
              <div class="stat-label">Năm Kinh Nghiệm</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">200+</div>
              <div class="stat-label">Dự Án</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">5.000+</div>
              <div class="stat-label">Khách Hàng</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">50+</div>
              <div class="stat-label">Đối Tác</div>
            </div>
          </div>
        </div>
      </div>',
      updated_at = NOW()
    WHERE page_id = about_page_id AND section_key = 'hero';

    -- 2. Update/Insert "Câu chuyện" section (id="cau-chuyen")
    INSERT INTO page_sections (id, page_id, section_key, name, section_type, display_order, content, images, published, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      about_page_id,
      'cau-chuyen',
      'Câu chuyện Inlandv',
      'content',
      2,
      '<div id="cau-chuyen" class="story-section">
        <div class="story-content">
          <p>INLANDV được chính thức thành lập vào năm 2022, được quản lý bởi Hội đồng quản trị với hơn 15 năm kinh nghiệm trong lĩnh vực bất động sản. Chúng tôi nhanh chóng thiết lập vị thế trong Bất động sản Công nghiệp - Thương mại, cung cấp giải pháp toàn diện cho việc thuê kho, đất công nghiệp và tòa nhà văn phòng tại TP.HCM và các tỉnh trọng điểm như Long An, Bình Dương, Bình Phước và Tây Ninh.</p>
          <p>Mạng lưới đối tác chiến lược của chúng tôi, với những người mà chúng tôi hợp tác để cung cấp giải pháp bất động sản được điều chỉnh cho sự phát triển sản xuất và kinh doanh. Một số đối tác đáng chú ý: Công ty Vật Liệu Hút Chân Không Cách Nhiệt, Khách Sạn Huazhu, Dự Án Eaton Park, và Global City.</p>
          <p>Với kinh nghiệm thực tế và khả năng đã được chứng minh, INLANDV sẵn sàng hợp tác với khách hàng để tạo ra giá trị lâu dài và thúc đẩy thành công bền vững.</p>
          <div class="vision-mission-values">
            <div class="value-card">
              <div class="value-icon">👁️</div>
              <h3>Tầm nhìn:</h3>
              <p>INLANDV hướng đến vị thế dẫn đầu trong lĩnh vực Bất động sản, đặc biệt là bất động sản công nghiệp, đồng thời xây dựng hệ sinh thái bất động sản đột phá và bền vững.</p>
            </div>
            <div class="value-card">
              <div class="value-icon">🚀</div>
              <h3>Sứ mệnh:</h3>
              <p>INLANDV cam kết mang đến giải pháp bất động sản toàn diện, tối ưu chi phí – gia tăng giá trị đầu tư. Chúng tôi đồng hành cùng doanh nghiệp mở rộng kết nối toàn cầu, nâng cao vị thế trên thị trường quốc tế.</p>
            </div>
            <div class="value-card">
              <div class="value-icon">❤️</div>
              <h3>Giá trị cốt lõi:</h3>
              <p>Tận tâm - Chuyên nghiệp - Minh bạch – Bền vững.</p>
            </div>
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

    -- 3. Update "Đội ngũ" section (id="doi-ngu")
    UPDATE page_sections
    SET 
      name = 'Đội ngũ lãnh đạo',
      content = '<div id="doi-ngu" class="team-section">
        <h2 class="section-title">Đội ngũ lãnh đạo</h2>
        <div class="team-carousel">
          <div class="team-member">
            <div class="member-image">
              <img src="/images/team/lisa-nghia.jpg" alt="Ms Lisa Nghia" />
            </div>
            <h3 class="member-name">Ms Lisa Nghia</h3>
            <p class="member-position">CEO & Founder</p>
            <p class="member-bio">Giới thiệu:....</p>
          </div>
          <div class="team-member">
            <div class="member-image">
              <img src="/images/team/oanh-hoang.jpg" alt="Ms Oanh Hoang" />
            </div>
            <h3 class="member-name">Ms Oanh Hoang</h3>
            <p class="member-position">COO</p>
            <p class="member-bio">Giới thiệu:....</p>
          </div>
          <div class="team-member">
            <div class="member-image">
              <img src="/images/team/anna-tran.jpg" alt="Ms Anna Tran" />
            </div>
            <h3 class="member-name">Ms Anna Tran</h3>
            <p class="member-position">CFO</p>
            <p class="member-bio">Giới thiệu:....</p>
          </div>
          <div class="team-member">
            <div class="member-image">
              <img src="/images/team/sarah-le.jpg" alt="Ms Sarah Le" />
            </div>
            <h3 class="member-name">Ms Sarah Le</h3>
            <p class="member-position">CMO</p>
            <p class="member-bio">Giới thiệu:....</p>
          </div>
        </div>
      </div>',
      updated_at = NOW()
    WHERE page_id = about_page_id AND section_key = 'doi-ngu';

    -- 4. Update "Tại sao" section (id="tai-sao")
    UPDATE page_sections
    SET 
      name = 'Tại sao nên chọn Inlandv',
      content = '<div id="tai-sao" class="why-choose-section">
        <div class="section-badge">UY TÍN & CHẤT LƯỢNG</div>
        <h2 class="section-title">Tại sao nên chọn <span class="highlight">Inlandv</span></h2>
        <p class="section-subtitle">Những điểm mạnh tạo nên uy tín và sự tin cậy của INLANDV trong lĩnh vực bất động sản công nghiệp</p>
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">🛡️</div>
            <h3>Kinh nghiệm dày dặn</h3>
            <p class="feature-subtitle">Hơn 15 năm trong lĩnh vực BĐS</p>
            <p>Với hơn 15 năm kinh nghiệm trong lĩnh vực bất động sản công nghiệp, INLANDV đã tích lũy kiến thức sâu rộng về thị trường, quy trình và xu hướng đầu tư. Chúng tôi hiểu rõ từng chi tiết pháp lý, quy hoạch và thực tiễn triển khai dự án.</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">👥</div>
            <h3>Đội ngũ chuyên nghiệp</h3>
            <p class="feature-subtitle">Chuyên gia hàng đầu</p>
            <p>Đội ngũ của chúng tôi bao gồm các chuyên gia có trình độ cao, am hiểu sâu về bất động sản công nghiệp, pháp lý và đầu tư. Mỗi thành viên đều được đào tạo bài bản và có kinh nghiệm thực tế trong việc hỗ trợ các dự án FDI thành công.</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🌐</div>
            <h3>Mạng lưới đối tác rộng lớn</h3>
            <p class="feature-subtitle">Kết nối toàn diện</p>
            <p>INLANDV sở hữu mạng lưới đối tác chiến lược rộng khắp, từ các chủ đầu tư KCN uy tín, nhà cung cấp dịch vụ chuyên nghiệp đến các tổ chức tài chính. Mạng lưới này giúp chúng tôi cung cấp giải pháp toàn diện và tối ưu cho khách hàng.</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">✅</div>
            <h3>Cam kết minh bạch</h3>
            <p class="feature-subtitle">Uy tín được đảm bảo</p>
            <p>Minh bạch trong mọi giao dịch là nguyên tắc hàng đầu của INLANDV. Chúng tôi cam kết cung cấp thông tin chính xác, rõ ràng và đầy đủ, đảm bảo khách hàng có đầy đủ cơ sở để đưa ra quyết định đầu tư đúng đắn.</p>
          </div>
        </div>
      </div>',
      updated_at = NOW()
    WHERE page_id = about_page_id AND section_key = 'tai-sao-chon-inlandv';

    -- 5. Update "Khách hàng" section (id="khach-hang")
    UPDATE page_sections
    SET 
      name = 'Khách hàng & Đối tác tiêu biểu',
      content = '<div id="khach-hang" class="clients-section">
        <div class="section-badge">KHÁCH HÀNG & ĐỐI TÁC</div>
        <h2 class="section-title">Khách hàng <span class="highlight">Tiêu biểu</span></h2>
        <p class="section-subtitle">Hợp tác cùng các công ty FDI hàng đầu và KCN lớn trên toàn quốc</p>
        <div class="clients-stats">
          <div class="stat-item">
            <div class="stat-icon">🏭</div>
            <div class="stat-number">50+</div>
            <div class="stat-label">KCN hợp tác</div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">👥</div>
            <div class="stat-number">100+</div>
            <div class="stat-label">Khách hàng FDI</div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">🎖️</div>
            <div class="stat-number">20+</div>
            <div class="stat-label">Đối tác chiến lược</div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">⭐</div>
            <div class="stat-number">98%</div>
            <div class="stat-label">Hài lòng</div>
          </div>
        </div>
        <div class="clients-categories">
          <div class="client-category">
            <div class="category-icon">🏢</div>
            <h3>Logo công ty FDI tiêu biểu</h3>
            <p class="category-subtitle">Dự án thành công <span class="highlight-number">15+</span></p>
            <div class="logos-grid">
              <!-- Logo images will be added via MediaPicker -->
            </div>
          </div>
          <div class="client-category">
            <div class="category-icon">🏭</div>
            <h3>KCN đối tác tiêu biểu</h3>
            <p class="category-subtitle">Dự án thành công <span class="highlight-number">50+</span></p>
            <div class="logos-grid">
              <!-- Logo images will be added via MediaPicker -->
            </div>
          </div>
          <div class="client-category">
            <div class="category-icon">🏗️</div>
            <h3>Đối tác thi công & Xây dựng</h3>
            <p class="category-subtitle">Dự án thành công <span class="highlight-number">20+</span></p>
            <div class="logos-grid">
              <!-- Logo images will be added via MediaPicker -->
            </div>
          </div>
        </div>
        <p class="footer-note">* Logo các đối tác sẽ được cập nhật trong phiên bản chính thức</p>
      </div>',
      updated_at = NOW()
    WHERE page_id = about_page_id AND section_key = 'khach-hang-doi-tac';

    -- Update display_order to match the correct sequence
    UPDATE page_sections SET display_order = 0 WHERE page_id = about_page_id AND section_key = 'hero';
    UPDATE page_sections SET display_order = 2 WHERE page_id = about_page_id AND section_key = 'cau-chuyen';
    UPDATE page_sections SET display_order = 4 WHERE page_id = about_page_id AND section_key = 'doi-ngu';
    UPDATE page_sections SET display_order = 5 WHERE page_id = about_page_id AND section_key = 'tai-sao-chon-inlandv';
    UPDATE page_sections SET display_order = 6 WHERE page_id = about_page_id AND section_key = 'khach-hang-doi-tac';

    RAISE NOTICE 'About page sections updated with proper div IDs';
  ELSE
    RAISE NOTICE 'About page not found';
  END IF;
END $$;


















