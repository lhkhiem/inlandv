export type InsightCategory = 'phan-tich-thi-truong' | 'cam-nang-dau-tu' | 'tin-tuc-fdi'

export type InsightArticle = {
  id: string
  slug: string
  title: string
  category: InsightCategory
  thumbnail: string
  excerpt: string
  content: string
  date: string
  author: string
  featured?: boolean
  readTime?: string
}

export const insightCategoryLabels: Record<InsightCategory, string> = {
  'phan-tich-thi-truong': 'Phân tích thị trường',
  'cam-nang-dau-tu': 'Cẩm nang đầu tư',
  'tin-tuc-fdi': 'Tin tức FDI'
}

export const insightArticles: InsightArticle[] = [
  // PHÂN TÍCH THỊ TRƯỜNG
  {
    id: 'i1',
    slug: 'thi-truong-bds-cong-nghiep-2024-co-hoi-thach-thuc',
    title: 'Thị trường BĐS công nghiệp 2024: Cơ hội và thách thức trong bối cảnh kinh tế mới',
    category: 'phan-tich-thi-truong',
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200',
    excerpt: 'Phân tích chuyên sâu về xu hướng phát triển BĐS công nghiệp Việt Nam trong bối cảnh kinh tế thế giới biến động và làn sóng dịch chuyển sản xuất từ Trung Quốc.',
    content: `<h2>Tổng quan thị trường</h2><p>Năm 2024 đánh dấu sự chuyển mình mạnh mẽ của thị trường BĐS công nghiệp Việt Nam...</p>`,
    date: '2024-11-20',
    author: 'TS. Nguyễn Văn Minh',
    featured: true,
    readTime: '8 phút đọc'
  },
  {
    id: 'i2',
    slug: 'kcn-phia-nam-diem-sang-dau-tu',
    title: 'KCN phía Nam: Điểm sáng thu hút đầu tư FDI trong 6 tháng đầu năm',
    category: 'phan-tich-thi-truong',
    thumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200',
    excerpt: 'Các tỉnh phía Nam tiếp tục dẫn đầu về thu hút vốn FDI với tổng giá trị đạt 8.5 tỷ USD, tăng 32% so với cùng kỳ.',
    content: `<h2>Phân tích chi tiết</h2><p>Khu vực phía Nam đang trở thành điểm đến hấp dẫn...</p>`,
    date: '2024-11-18',
    author: 'Lê Thị Hương',
    readTime: '6 phút đọc'
  },
  {
    id: 'i3',
    slug: 'gia-thue-dat-cong-nghiep-tang-nhe',
    title: 'Giá thuê đất công nghiệp tăng nhẹ, vẫn hấp dẫn so với khu vực',
    category: 'phan-tich-thi-truong',
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200',
    excerpt: 'Mức giá thuê đất công nghiệp tại các KCN trọng điểm tăng 5-7% so với đầu năm nhưng vẫn cạnh tranh với Thái Lan và Indonesia.',
    content: `<h2>So sánh giá thuê</h2><p>Phân tích chi tiết về mức giá thuê...</p>`,
    date: '2024-11-15',
    author: 'Trần Minh Tuấn',
    readTime: '5 phút đọc'
  },
  {
    id: 'i4',
    slug: 'dong-thai-fdi-tu-han-quoc-nhat-ban',
    title: 'Động thái FDI từ Hàn Quốc và Nhật Bản: Tín hiệu tích cực cho BĐS công nghiệp',
    category: 'phan-tich-thi-truong',
    thumbnail: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?q=80&w=1200',
    excerpt: 'Các tập đoàn lớn từ Hàn Quốc và Nhật Bản đang tăng cường đầu tư vào nhà máy sản xuất tại Việt Nam.',
    content: `<h2>Phân tích dòng vốn</h2><p>Chi tiết về xu hướng đầu tư...</p>`,
    date: '2024-11-12',
    author: 'Phạm Đức Anh',
    readTime: '7 phút đọc'
  },
  {
    id: 'i5',
    slug: 'ha-tang-kcn-can-nang-cap',
    title: 'Hạ tầng KCN cần nâng cấp để đáp ứng yêu cầu nhà đầu tư cao cấp',
    category: 'phan-tich-thi-truong',
    thumbnail: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1200',
    excerpt: 'Nhiều KCN cần đầu tư thêm vào hệ thống điện, nước, xử lý chất thải để thu hút các dự án công nghệ cao.',
    content: `<h2>Đánh giá hạ tầng</h2><p>Phân tích tình trạng hạ tầng hiện tại...</p>`,
    date: '2024-11-10',
    author: 'Ngô Thị Lan',
    readTime: '6 phút đọc'
  },

  // CẨM NANG ĐẦU TƯ
  {
    id: 'i6',
    slug: 'thu-tuc-thanh-lap-cong-ty-fdi',
    title: 'Thủ tục thành lập công ty FDI tại Việt Nam: Hướng dẫn từng bước chi tiết',
    category: 'cam-nang-dau-tu',
    thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1200',
    excerpt: 'Hướng dẫn đầy đủ quy trình thành lập doanh nghiệp có vốn đầu tư nước ngoài, từ xin giấy phép đến đăng ký kinh doanh.',
    content: `<h2>Các bước thực hiện</h2><p>Quy trình chi tiết từng bước...</p>`,
    date: '2024-11-19',
    author: 'Luật sư Vũ Minh Hà',
    featured: true,
    readTime: '10 phút đọc'
  },
  {
    id: 'i7',
    slug: 'uu-dai-thue-cho-fdi',
    title: 'Ưu đãi thuế cho doanh nghiệp FDI: Những điều cần biết năm 2024',
    category: 'cam-nang-dau-tu',
    thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1200',
    excerpt: 'Tổng hợp các chính sách ưu đãi thuế thu nhập doanh nghiệp, thuế xuất nhập khẩu và miễn giảm tiền thuê đất.',
    content: `<h2>Các chính sách ưu đãi</h2><p>Chi tiết từng loại ưu đãi...</p>`,
    date: '2024-11-17',
    author: 'ThS. Đặng Văn Tùng',
    readTime: '8 phút đọc'
  },
  {
    id: 'i8',
    slug: 'chon-dia-diem-xay-nha-may',
    title: 'Cách chọn địa điểm xây dựng nhà máy phù hợp: 7 tiêu chí quan trọng',
    category: 'cam-nang-dau-tu',
    thumbnail: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?q=80&w=1200',
    excerpt: 'Phân tích các yếu tố cần cân nhắc khi lựa chọn vị trí đầu tư: hạ tầng, nhân công, chính sách, logistics.',
    content: `<h2>Tiêu chí đánh giá</h2><p>7 yếu tố quan trọng...</p>`,
    date: '2024-11-14',
    author: 'KTS. Trần Quốc Huy',
    readTime: '9 phút đọc'
  },
  {
    id: 'i9',
    slug: 'giay-phep-moi-truong-dau-tu',
    title: 'Giấy phép môi trường cho dự án đầu tư: Quy trình và hồ sơ cần thiết',
    category: 'cam-nang-dau-tu',
    thumbnail: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1200',
    excerpt: 'Hướng dẫn chi tiết về đánh giá tác động môi trường, cam kết bảo vệ môi trường và xin cấp phép xả thải.',
    content: `<h2>Quy trình thực hiện</h2><p>Các bước xin giấy phép...</p>`,
    date: '2024-11-11',
    author: 'TS. Hoàng Thị Mai',
    readTime: '7 phút đọc'
  },
  {
    id: 'i10',
    slug: 'so-sanh-kcn-viet-nam',
    title: 'So sánh 10 KCN hàng đầu Việt Nam: Ưu nhược điểm từng khu vực',
    category: 'cam-nang-dau-tu',
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200',
    excerpt: 'Đánh giá chi tiết về hạ tầng, giá thuê, chính sách ưu đãi và tiềm năng phát triển của các KCN trọng điểm.',
    content: `<h2>Bảng so sánh chi tiết</h2><p>Phân tích từng KCN...</p>`,
    date: '2024-11-08',
    author: 'Nguyễn Hoàng Long',
    readTime: '12 phút đọc'
  },

  // TIN TỨC FDI
  {
    id: 'i11',
    slug: 'samsung-mo-rong-nha-may-bac-ninh',
    title: 'Samsung mở rộng nhà máy tại Bắc Ninh với vốn đầu tư bổ sung 1.2 tỷ USD',
    category: 'tin-tuc-fdi',
    thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200',
    excerpt: 'Tập đoàn Samsung Electronics công bố kế hoạch mở rộng quy mô sản xuất smartphone và linh kiện điện tử.',
    content: `<h2>Chi tiết dự án</h2><p>Kế hoạch mở rộng của Samsung...</p>`,
    date: '2024-11-21',
    author: 'Biên tập viên',
    featured: true,
    readTime: '5 phút đọc'
  },
  {
    id: 'i12',
    slug: 'lego-xay-nha-may-binh-duong',
    title: 'LEGO chọn Bình Dương làm địa điểm xây dựng nhà máy đầu tiên tại Đông Nam Á',
    category: 'tin-tuc-fdi',
    thumbnail: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200',
    excerpt: 'Nhà sản xuất đồ chơi nổi tiếng Đan Mạch đầu tư 1 tỷ USD xây dựng nhà máy sản xuất tại KCN Việt Nam Singapore III.',
    content: `<h2>Ý nghĩa dự án</h2><p>Tác động đến ngành công nghiệp...</p>`,
    date: '2024-11-16',
    author: 'Biên tập viên',
    readTime: '6 phút đọc'
  },
  {
    id: 'i13',
    slug: 'lg-energy-solution-dau-tu-haiphong',
    title: 'LG Energy Solution đầu tư 2.5 tỷ USD vào nhà máy pin EV tại Hải Phòng',
    category: 'tin-tuc-fdi',
    thumbnail: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=1200',
    excerpt: 'Dự án sản xuất pin lithium-ion cho xe điện dự kiến hoàn thành vào năm 2026 với công suất 30 GWh/năm.',
    content: `<h2>Thông tin dự án</h2><p>Chi tiết về kế hoạch đầu tư...</p>`,
    date: '2024-11-13',
    author: 'Biên tập viên',
    readTime: '5 phút đọc'
  },
  {
    id: 'i14',
    slug: 'apple-nha-cung-cap-viet-nam',
    title: 'Apple tăng cường hợp tác với các nhà cung cấp Việt Nam trong chuỗi sản xuất',
    category: 'tin-tuc-fdi',
    thumbnail: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=1200',
    excerpt: 'Tim Cook khẳng định Việt Nam là mắt xích quan trọng trong chiến lược đa dạng hóa chuỗi cung ứng của Apple.',
    content: `<h2>Chiến lược mới</h2><p>Kế hoạch phát triển nhà cung cấp...</p>`,
    date: '2024-11-09',
    author: 'Biên tập viên',
    readTime: '7 phút đọc'
  },
  {
    id: 'i15',
    slug: 'eu-dau-tu-nang-luong-sach',
    title: 'EU đầu tư 500 triệu Euro vào các dự án năng lượng sạch tại Việt Nam',
    category: 'tin-tuc-fdi',
    thumbnail: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1200',
    excerpt: 'Liên minh châu Âu cam kết hỗ trợ Việt Nam phát triển năng lượng tái tạo và giảm phát thải carbon.',
    content: `<h2>Chương trình hỗ trợ</h2><p>Chi tiết về các dự án...</p>`,
    date: '2024-11-06',
    author: 'Biên tập viên',
    readTime: '6 phút đọc'
  }
]

export function getArticlesByCategory(category: InsightCategory): InsightArticle[] {
  return insightArticles.filter(article => article.category === category)
}

export function getFeaturedArticleByCategory(category: InsightCategory): InsightArticle | undefined {
  return insightArticles.find(article => article.category === category && article.featured)
}

export function getAllCategories(): InsightCategory[] {
  return ['phan-tich-thi-truong', 'cam-nang-dau-tu', 'tin-tuc-fdi']
}
