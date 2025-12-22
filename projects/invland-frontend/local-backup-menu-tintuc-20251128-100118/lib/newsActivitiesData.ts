export type NewsActivityCategory = 
  | 'thi-truong-bds-cong-nghiep'
  | 'tin-tuc-fdi' 
  | 'su-kien-tham-gia'
  | 'du-an-moi'
  | 'hoat-dong-csr'

export type NewsActivityArticle = {
  id: string
  slug: string
  title: string
  category: NewsActivityCategory
  thumbnail: string
  excerpt: string
  content: string
  date: string
  author?: string
  featured?: boolean
  readTime?: string
}

export const newsActivityCategoryLabels: Record<NewsActivityCategory, string> = {
  'thi-truong-bds-cong-nghiep': 'Tin tức thị trường BĐS công nghiệp',
  'tin-tuc-fdi': 'Tin tức FDI',
  'su-kien-tham-gia': 'Sự kiện đã tham gia',
  'du-an-moi': 'Dự án mới triển khai',
  'hoat-dong-csr': 'Hoạt động CSR'
}

export const newsActivityArticles: NewsActivityArticle[] = [
  // THỊ TRƯỜNG BĐS CÔNG NGHIỆP
  {
    id: 'na1',
    slug: 'gia-thue-dat-kcn-tang-10-phan-tram',
    title: 'Giá thuê đất KCN tăng 10% trong quý III/2024 do nhu cầu cao',
    category: 'thi-truong-bds-cong-nghiep',
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200',
    excerpt: 'Theo báo cáo mới nhất, giá thuê đất tại các KCN trọng điểm miền Nam tăng trung bình 10% do nguồn cung hạn chế và nhu cầu từ FDI tăng mạnh.',
    content: `<h2>Phân tích chi tiết</h2><p>Thị trường đất công nghiệp đang chứng kiến...</p>`,
    date: '2024-11-22',
    author: 'Phòng Nghiên cứu INLANDV',
    featured: true,
    readTime: '5 phút đọc'
  },
  {
    id: 'na2',
    slug: 'nguon-cung-dat-cong-nghiep-tang',
    title: 'Nguồn cung đất công nghiệp dự kiến tăng 25% vào năm 2025',
    category: 'thi-truong-bds-cong-nghiep',
    thumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200',
    excerpt: 'Các tỉnh phía Bắc và miền Trung đang đẩy nhanh việc phát triển KCN mới để đáp ứng nhu cầu đầu tư.',
    content: `<h2>Dự báo thị trường</h2><p>Nguồn cung mới...</p>`,
    date: '2024-11-20',
    author: 'Nguyễn Văn A',
    readTime: '6 phút đọc'
  },
  {
    id: 'na3',
    slug: 'bds-logistics-hut-von-dau-tu',
    title: 'BĐS logistics hút vốn đầu tư mạnh từ các quỹ đầu tư nước ngoài',
    category: 'thi-truong-bds-cong-nghiep',
    thumbnail: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?q=80&w=1200',
    excerpt: 'Các nhà kho, trung tâm phân phối trở thành điểm sáng trong phân khúc BĐS công nghiệp.',
    content: `<h2>Xu hướng đầu tư</h2><p>Logistics...</p>`,
    date: '2024-11-18',
    readTime: '7 phút đọc'
  },
  {
    id: 'na4',
    slug: 'kcn-xanh-xu-huong-moi',
    title: 'KCN xanh - Xu hướng bền vững cho bất động sản công nghiệp',
    category: 'thi-truong-bds-cong-nghiep',
    thumbnail: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200',
    excerpt: 'Các KCN theo tiêu chuẩn xanh ngày càng được ưa chuộng nhờ chính sách môi trường nghiêm ngặt.',
    content: `<h2>Tiêu chuẩn xanh</h2><p>KCN bền vững...</p>`,
    date: '2024-11-15',
    readTime: '8 phút đọc'
  },
  {
    id: 'na5',
    slug: 'thanh-khoan-bds-cong-nghiep-tang',
    title: 'Thanh khoản BĐS công nghiệp đạt mức cao nhất trong 3 năm',
    category: 'thi-truong-bds-cong-nghiep',
    thumbnail: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200',
    excerpt: 'Giao dịch chuyển nhượng và cho thuê tại các KCN tăng trưởng ấn tượng trong 9 tháng đầu năm.',
    content: `<h2>Phân tích thị trường</h2><p>Thanh khoản...</p>`,
    date: '2024-11-12',
    readTime: '6 phút đọc'
  },

  // TIN TỨC FDI
  {
    id: 'na6',
    slug: 'von-fdi-vao-viet-nam-dat-ky-luc',
    title: 'Vốn FDI vào Việt Nam đạt kỷ lục 28 tỷ USD trong 10 tháng đầu năm',
    category: 'tin-tuc-fdi',
    thumbnail: 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?q=80&w=1200',
    excerpt: 'Việt Nam tiếp tục là điểm đến hấp dẫn cho các nhà đầu tư nước ngoài nhờ chính sách ưu đãi và vị trí địa lý.',
    content: `<h2>Thống kê đầu tư</h2><p>Vốn FDI...</p>`,
    date: '2024-11-21',
    author: 'Ban biên tập',
    featured: true,
    readTime: '5 phút đọc'
  },
  {
    id: 'na7',
    slug: 'intel-mo-rong-dau-tu-tai-viet-nam',
    title: 'Intel công bố kế hoạch mở rộng đầu tư thêm 3 tỷ USD tại Việt Nam',
    category: 'tin-tuc-fdi',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200',
    excerpt: 'Gã khổng lồ công nghệ tiếp tục đặt niềm tin vào Việt Nam như trung tâm sản xuất chip bán dẫn.',
    content: `<h2>Dự án Intel</h2><p>Mở rộng...</p>`,
    date: '2024-11-19',
    readTime: '6 phút đọc'
  },
  {
    id: 'na8',
    slug: 'nhat-ban-dan-dau-fdi-cong-nghiep',
    title: 'Nhật Bản dẫn đầu đầu tư FDI vào lĩnh vực sản xuất công nghiệp',
    category: 'tin-tuc-fdi',
    thumbnail: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?q=80&w=1200',
    excerpt: 'Các doanh nghiệp Nhật đang tích cực chuyển dịch chuỗi cung ứng sang Việt Nam.',
    content: `<h2>Đầu tư Nhật Bản</h2><p>Xu hướng...</p>`,
    date: '2024-11-17',
    readTime: '7 phút đọc'
  },
  {
    id: 'na9',
    slug: 'fdi-nang-luong-sach-tang-manh',
    title: 'FDI vào năng lượng sạch và công nghệ xanh tăng 150%',
    category: 'tin-tuc-fdi',
    thumbnail: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1200',
    excerpt: 'Cam kết Net Zero thúc đẩy làn sóng đầu tư vào năng lượng tái tạo và sản xuất bền vững.',
    content: `<h2>Năng lượng xanh</h2><p>Đầu tư...</p>`,
    date: '2024-11-14',
    readTime: '8 phút đọc'
  },
  {
    id: 'na10',
    slug: 'han-quoc-dau-tu-nha-may-pin',
    title: 'Hàn Quốc đầu tư 5 tỷ USD vào cụm nhà máy sản xuất pin điện tử',
    category: 'tin-tuc-fdi',
    thumbnail: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=1200',
    excerpt: 'Các tập đoàn LG, Samsung SDI đẩy mạnh đầu tư vào sản xuất pin cho xe điện.',
    content: `<h2>Công nghệ pin</h2><p>Hàn Quốc...</p>`,
    date: '2024-11-11',
    readTime: '6 phút đọc'
  },

  // SỰ KIỆN THAM GIA
  {
    id: 'na11',
    slug: 'inlandv-tai-tro-hoi-thao-dau-tu-fdi',
    title: 'INLANDV đồng tài trợ Hội thảo Đầu tư FDI Việt Nam 2024',
    category: 'su-kien-tham-gia',
    thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200',
    excerpt: 'Sự kiện quy tụ hơn 500 doanh nghiệp và nhà đầu tư trong nước và quốc tế.',
    content: `<h2>Hội thảo</h2><p>Sự kiện...</p>`,
    date: '2024-11-10',
    author: 'PR Team',
    featured: true,
    readTime: '5 phút đọc'
  },
  {
    id: 'na12',
    slug: 'tham-du-vietnam-industrial-real-estate-forum',
    title: 'INLANDV tham dự Vietnam Industrial Real Estate Forum 2024',
    category: 'su-kien-tham-gia',
    thumbnail: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200',
    excerpt: 'Diễn đàn thường niên về xu hướng và cơ hội đầu tư bất động sản công nghiệp.',
    content: `<h2>Diễn đàn</h2><p>Tham gia...</p>`,
    date: '2024-11-05',
    readTime: '4 phút đọc'
  },
  {
    id: 'na13',
    slug: 'ky-ket-hop-tac-cac-doi-tac-quoc-te',
    title: 'Ký kết hợp tác chiến lược với 3 đối tác quốc tế tại Singapore',
    category: 'su-kien-tham-gia',
    thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1200',
    excerpt: 'Mở rộng mạng lưới đối tác để phục vụ tốt hơn nhu cầu đầu tư của khách hàng FDI.',
    content: `<h2>Hợp tác</h2><p>Ký kết...</p>`,
    date: '2024-10-28',
    readTime: '6 phút đọc'
  },

  // DỰ ÁN MỚI
  {
    id: 'na14',
    slug: 'ra-mat-du-an-kcn-long-duc-3',
    title: 'Ra mắt dự án KCN Long Đức 3 với quy mô 500 ha tại Đồng Nai',
    category: 'du-an-moi',
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200',
    excerpt: 'INLANDV là đơn vị phân phối độc quyền cho dự án KCN hiện đại bậc nhất khu vực phía Nam.',
    content: `<h2>Dự án mới</h2><p>KCN Long Đức...</p>`,
    date: '2024-11-08',
    author: 'Sales Team',
    featured: true,
    readTime: '7 phút đọc'
  },
  {
    id: 'na15',
    slug: 'khai-truong-trung-tam-logistics-vsip-3',
    title: 'Khai trương Trung tâm Logistics VSIP III tại Bắc Ninh',
    category: 'du-an-moi',
    thumbnail: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?q=80&w=1200',
    excerpt: 'Dự án logistics hiện đại với công nghệ tự động hóa đầu tiên tại Việt Nam.',
    content: `<h2>Logistics</h2><p>Khai trương...</p>`,
    date: '2024-11-03',
    readTime: '5 phút đọc'
  },
  {
    id: 'na16',
    slug: 'khoi-cong-nha-may-samsung-display',
    title: 'Khởi công nhà máy Samsung Display tại KCN Yên Phong',
    category: 'du-an-moi',
    thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200',
    excerpt: 'Dự án trị giá 2.5 tỷ USD dự kiến hoàn thành vào Q3/2025.',
    content: `<h2>Samsung</h2><p>Khởi công...</p>`,
    date: '2024-10-25',
    readTime: '6 phút đọc'
  },

  // HOẠT ĐỘNG CSR
  {
    id: 'na17',
    slug: 'tang-hoc-bong-cho-sinh-vien-ngheo',
    title: 'INLANDV trao 100 suất học bổng cho sinh viên nghèo vượt khó',
    category: 'hoat-dong-csr',
    thumbnail: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200',
    excerpt: 'Chương trình học bổng "INLANDV - Ươm mầm tương lai" năm thứ 3 liên tiếp.',
    content: `<h2>Học bổng</h2><p>Trao học bổng...</p>`,
    date: '2024-11-01',
    author: 'CSR Team',
    featured: true,
    readTime: '4 phút đọc'
  },
  {
    id: 'na18',
    slug: 'trong-cay-xanh-tai-cac-kcn',
    title: 'Trồng 5,000 cây xanh tại các KCN để cải thiện môi trường',
    category: 'hoat-dong-csr',
    thumbnail: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=1200',
    excerpt: 'Chiến dịch "KCN Xanh" góp phần bảo vệ môi trường và cải thiện chất lượng không khí.',
    content: `<h2>Môi trường</h2><p>Trồng cây...</p>`,
    date: '2024-10-20',
    readTime: '5 phút đọc'
  },
  {
    id: 'na19',
    slug: 'ho-tro-cong-nhan-kho-khan',
    title: 'Hỗ trợ 500 gia đình công nhân KCN gặp khó khăn do bão lũ',
    category: 'hoat-dong-csr',
    thumbnail: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200',
    excerpt: 'Trao quà trị giá 1 tỷ đồng hỗ trợ khẩn cấp cho các gia đình bị ảnh hưởng.',
    content: `<h2>Cứu trợ</h2><p>Hỗ trợ...</p>`,
    date: '2024-10-15',
    readTime: '4 phút đọc'
  }
]

export function getArticlesByCategory(category: NewsActivityCategory): NewsActivityArticle[] {
  return newsActivityArticles.filter(article => article.category === category)
}

export function getFeaturedArticleByCategory(category: NewsActivityCategory): NewsActivityArticle | undefined {
  return newsActivityArticles.find(article => article.category === category && article.featured)
}

export function getAllCategories(): NewsActivityCategory[] {
  return [
    'thi-truong-bds-cong-nghiep',
    'tin-tuc-fdi',
    'su-kien-tham-gia',
    'du-an-moi',
    'hoat-dong-csr'
  ]
}
