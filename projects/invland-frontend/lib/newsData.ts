export type NewsCategory = 'tin-thi-truong' | 'quy-hoach-chinh-sach' | 'tu-van-hoi-dap' | 'tuyen-dung'

export type NewsArticle = {
  id: string
  slug: string
  title: string
  category: NewsCategory
  thumbnail: string
  excerpt: string
  content: string
  date: string
  author?: string
  featured?: boolean
}

export const newsCategoryLabels: Record<NewsCategory, string> = {
  'tin-thi-truong': 'Tin thị trường',
  'quy-hoach-chinh-sach': 'Tin quy hoạch – Chính sách',
  'tu-van-hoi-dap': 'Tư vấn hỏi đáp',
  'tuyen-dung': 'Tuyển dụng'
}

export const newsArticles: NewsArticle[] = [
  {
    id: 'n1',
    slug: 'ra-mat-du-an-vinhomes-grand-park-2024',
    title: 'Ra mắt dự án Vinhomes Grand Park – Đô thị thông minh quy mô lớn nhất miền Nam',
    category: 'tin-thi-truong',
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200',
    excerpt: 'Vinhomes Grand Park chính thức ra mắt với quy mô 271 ha, kết hợp không gian sống xanh và công nghệ thông minh hiện đại.',
    content: `
      <h2>Giới thiệu dự án</h2>
      <p>Vinhomes Grand Park là dự án đô thị thông minh quy mô lớn nhất khu vực phía Đông TP.HCM với tổng diện tích 271 ha. Dự án được quy hoạch bài bản theo tiêu chuẩn quốc tế, tích hợp đầy đủ tiện ích nội khu và kết nối giao thông thuận lợi.</p>
      
      <h3>Vị trí đắc địa</h3>
      <p>Tọa lạc tại phường Long Bình và Phước Bình, Quận 9, dự án được bao bọc bởi 3 mặt sông và kết nối trực tiếp với trung tâm quận 1 qua các trục giao thông chính.</p>
      
      <h3>Tiện ích nội khu</h3>
      <ul>
        <li>Hệ thống công viên và công viên trung tâm 36 ha</li>
        <li>Trung tâm thương mại Vincom Mega Mall</li>
        <li>Trường học liên cấp quốc tế Vinschool</li>
        <li>Bệnh viện đa khoa Vinmec</li>
        <li>Khu thể thao ngoài trời và trong nhà</li>
      </ul>
      
      <h3>Giá trị đầu tư</h3>
      <p>Với vị trí chiến lược và tiềm năng phát triển mạnh mẽ của khu Đông TP.HCM, Vinhomes Grand Park được đánh giá là một trong những dự án có tiềm năng sinh lời cao trong 5 năm tới.</p>
    `,
    date: '2024-11-15',
    author: 'Nguyễn Văn A',
    featured: true
  },
  {
    id: 'n2',
    slug: 'the-metroopolis-noi-bat-voi-thiet-ke-hien-dai',
    title: 'The Metropolis – Nơi hội tụ giới thượng lưu với thiết kế hiện đại đẳng cấp',
    category: 'tin-thi-truong',
    thumbnail: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1200',
    excerpt: 'The Metropolis mang đến không gian sống đẳng cấp 5 sao với thiết kế sang trọng và đầy đủ tiện ích cao cấp.',
    content: `
      <h2>Tổng quan dự án</h2>
      <p>The Metropolis là tổ hợp căn hộ cao cấp tọa lạc tại vị trí vàng quận Ba Đình, Hà Nội. Với thiết kế hiện đại và hệ thống tiện ích 5 sao, dự án hứa hẹn mang đến trải nghiệm sống đỉnh cao.</p>
      
      <h3>Thiết kế nội thất</h3>
      <p>Các căn hộ được trang bị nội thất cao cấp từ các thương hiệu hàng đầu thế giới, tối ưu hóa không gian và ánh sáng tự nhiên.</p>
    `,
    date: '2024-11-10',
    author: 'Trần Thị B'
  },
  {
    id: 'n3',
    slug: 'thi-truong-bat-dong-san-q4-2024-tang-truong-manh',
    title: 'Thị trường bất động sản Q4/2024 tăng trưởng mạnh mẽ với nhiều dự án mới',
    category: 'tin-thi-truong',
    thumbnail: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200',
    excerpt: 'Báo cáo cho thấy thị trường BĐS quý 4 ghi nhận mức tăng trưởng ấn tượng với nguồn cung dồi dào và thanh khoản cao.',
    content: `
      <h2>Phân tích thị trường</h2>
      <p>Quý 4/2024 đánh dấu sự phục hồi mạnh mẽ của thị trường bất động sản với tổng nguồn cung tăng 35% so với cùng kỳ năm trước.</p>
      
      <h3>Các phân khúc nổi bật</h3>
      <ul>
        <li>Căn hộ trung cấp: tăng 40% về lượng giao dịch</li>
        <li>Biệt thự nghỉ dưỡng: thu hút mạnh nhà đầu tư</li>
        <li>Nhà phố thương mại: khan hiếm nguồn cung</li>
      </ul>
    `,
    date: '2024-11-08',
    author: 'Lê Văn C'
  },
  {
    id: 'n4',
    slug: 'uu-dai-khung-mua-nha-thang-11',
    title: 'Ưu đãi khủng tháng 11 – Giảm ngay 5% và hỗ trợ lãi suất 0% đến 24 tháng',
    category: 'quy-hoach-chinh-sach',
    thumbnail: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200',
    excerpt: 'Chương trình ưu đãi hấp dẫn nhất năm dành cho khách hàng mua nhà trong tháng 11 với nhiều chính sách hỗ trợ vượt trội.',
    content: `
      <h2>Chi tiết chương trình</h2>
      <p>Inland Real Estate triển khai chương trình ưu đãi đặc biệt trong tháng 11 nhằm tri ân khách hàng với các chính sách hỗ trợ tối đa.</p>
      
      <h3>Các ưu đãi nổi bật</h3>
      <ul>
        <li>Giảm ngay 5% giá trị căn hộ</li>
        <li>Hỗ trợ lãi suất 0% lên đến 24 tháng</li>
        <li>Tặng gói nội thất cao cấp trị giá 300 triệu</li>
        <li>Miễn phí 2 năm phí quản lý</li>
      </ul>
      
      <h3>Điều kiện áp dụng</h3>
      <p>Chương trình áp dụng cho khách hàng ký HĐMB và thanh toán từ 30% giá trị căn hộ trong tháng 11/2024.</p>
    `,
    date: '2024-11-05',
    author: 'Phạm Thị D'
  },
  {
    id: 'n5',
    slug: 'inland-to-chuc-su-kien-giao-lu-khach-hang',
    title: 'INLAND tổ chức sự kiện giao lưu khách hàng và công bố chiến lược 2025',
    category: 'tu-van-hoi-dap',
    thumbnail: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200',
    excerpt: 'Sự kiện giao lưu khách hàng VIP với sự tham gia của hơn 300 khách mời và đối tác chiến lược.',
    content: `
      <h2>Sự kiện thành công rực rỡ</h2>
      <p>Ngày 20/11/2024, INLAND Real Estate đã tổ chức thành công sự kiện giao lưu khách hàng VIP tại khách sạn 5 sao JW Marriott với sự tham gia của hơn 300 khách mời, đối tác và nhà đầu tư.</p>
      
      <h3>Nội dung chính</h3>
      <ul>
        <li>Công bố chiến lược kinh doanh 2025</li>
        <li>Ra mắt 5 dự án trọng điểm</li>
        <li>Trao giải thưởng khách hàng xuất sắc</li>
        <li>Ký kết hợp tác với các đối tác quốc tế</li>
      </ul>
    `,
    date: '2024-11-20',
    author: 'Ban Biên Tập'
  },
  {
    id: 'n6',
    slug: 'sunshine-city-west-point-diem-nhan-moi',
    title: 'Sunshine City West Point – Điểm nhấn mới của thị trường phía Tây Hà Nội',
    category: 'tin-thi-truong',
    thumbnail: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200',
    excerpt: 'Dự án kết hợp hài hòa giữa không gian sống xanh và tiện ích hiện đại, hứa hẹn trở thành tâm điểm đầu tư.',
    content: `
      <h2>Tổng quan</h2>
      <p>Sunshine City West Point là dự án căn hộ cao cấp được phát triển bởi Sunshine Group tại khu vực phía Tây Hà Nội.</p>
    `,
    date: '2024-11-12'
  },
  {
    id: 'n7',
    slug: 'nha-dau-tu-nuoc-ngoai-quan-tam-bds-viet',
    title: 'Nhà đầu tư nước ngoài gia tăng quan tâm thị trường BĐS Việt Nam',
    category: 'tin-thi-truong',
    thumbnail: 'https://images.unsplash.com/photo-1460472178825-e5240623afd5?q=80&w=1200',
    excerpt: 'Dòng vốn FDI đổ vào bất động sản Việt Nam tăng 28% trong 9 tháng đầu năm 2024.',
    content: `
      <h2>Xu hướng đầu tư</h2>
      <p>Thị trường BĐS Việt Nam ngày càng thu hút sự chú ý của các nhà đầu tư quốc tế nhờ tiềm năng tăng trưởng và chính sách cởi mở.</p>
    `,
    date: '2024-11-07'
  },
  {
    id: 'n8',
    slug: 'mien-phi-phi-sang-nhuong-thang-12',
    title: 'Chính sách ưu đãi tháng 12: Miễn phí phí sang nhượng và hỗ trợ vay vốn',
    category: 'quy-hoach-chinh-sach',
    thumbnail: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=1200',
    excerpt: 'Nhận ngay gói ưu đãi trị giá lên đến 500 triệu khi đăng ký mua căn hộ trong tháng 12.',
    content: `
      <h2>Ưu đãi đặc biệt</h2>
      <p>Chương trình dành riêng cho khách hàng có nhu cầu an cư hoặc đầu tư dài hạn.</p>
    `,
    date: '2024-11-18'
  }
]
