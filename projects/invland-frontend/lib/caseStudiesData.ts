export interface CaseStudy {
  id: string
  slug: string
  projectName: string
  client: string
  industry: string
  location: string
  year: number
  challenge: string
  solution: string
  results: {
    metric: string
    value: string
    description: string
  }[]
  testimonial: {
    quote: string
    author: string
    role: string
    company: string
  }
  images: string[]
  video?: string
  tags: string[]
}

export const caseStudies: CaseStudy[] = [
  {
    id: '1',
    slug: 'khu-cong-nghiep-vsip-bac-ninh',
    projectName: 'Khu Công Nghiệp VSIP Bắc Ninh',
    client: 'Tập đoàn VSIP',
    industry: 'Khu Công Nghiệp',
    location: 'Bắc Ninh, Việt Nam',
    year: 2023,
    challenge: 'VSIP cần tìm kiếm và thu hút các nhà đầu tư FDI chất lượng cao cho khu công nghiệp mới tại Bắc Ninh trong bối cảnh cạnh tranh gay gắt từ các KCN lân cận. Thách thức lớn nhất là làm nổi bật ưu điểm vượt trội về hạ tầng, vị trí địa lý và chính sách ưu đãi.',
    solution: 'INLANDV triển khai chiến lược tư vấn và marketing tổng thể bao gồm: (1) Phân tích chi tiết thị trường và định vị KCN; (2) Xây dựng hồ sơ năng lực chuyên nghiệp đa ngôn ngữ; (3) Kết nối trực tiếp với các tập đoàn FDI tiềm năng từ Nhật Bản, Hàn Quốc, và Châu Âu; (4) Tổ chức các sự kiện networking và roadshow quốc tế; (5) Tư vấn pháp lý và thủ tục đầu tư toàn diện.',
    results: [
      {
        metric: 'Tỷ lệ lấp đầy',
        value: '85%',
        description: 'Đạt trong vòng 18 tháng kể từ khi khởi động dự án'
      },
      {
        metric: 'Nhà đầu tư FDI',
        value: '12',
        description: 'Các tập đoàn lớn từ 5 quốc gia đã ký hợp đồng thuê'
      },
      {
        metric: 'Vốn đầu tư thu hút',
        value: '$450M',
        description: 'Tổng vốn FDI cam kết đầu tư vào KCN'
      }
    ],
    testimonial: {
      quote: 'INLANDV đã chứng minh năng lực vượt trội trong việc kết nối và thu hút nhà đầu tư chất lượng cao. Đội ngũ chuyên nghiệp, am hiểu sâu thị trường và luôn đặt lợi ích khách hàng lên hàng đầu.',
      author: 'Ông Nguyễn Văn Thành',
      role: 'Giám Đốc Điều Hành',
      company: 'VSIP Bắc Ninh'
    },
    images: [
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2000',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2000',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2000'
    ],
    tags: ['Khu Công Nghiệp', 'FDI', 'Tư vấn đầu tư', 'Bắc Ninh']
  },
  {
    id: '2',
    slug: 'du-an-vinhomes-smart-city',
    projectName: 'Vinhomes Smart City',
    client: 'Tập đoàn Vingroup',
    industry: 'Bất Động Sản Nhà Ở',
    location: 'Hà Nội, Việt Nam',
    year: 2022,
    challenge: 'Vingroup cần đẩy mạnh tiêu thụ hơn 2.000 căn hộ tại dự án Vinhomes Smart City trong bối cảnh thị trường bất động sản chững lại sau đại dịch. Khách hàng tiềm năng do dự về khả năng thanh toán và giá trị đầu tư dài hạn.',
    solution: 'INLANDV thiết kế và triển khai chiến dịch marketing 360 độ kết hợp online và offline: (1) Tổ chức chuỗi sự kiện trải nghiệm tại dự án với demo công nghệ thông minh; (2) Xây dựng nội dung marketing tập trung vào giá trị sống hiện đại và tiềm năng tăng giá; (3) Chương trình ưu đãi tài chính linh hoạt phối hợp với ngân hàng; (4) Digital marketing targeting chính xác phân khúc khách hàng trẻ, gia đình trẻ có thu nhập cao.',
    results: [
      {
        metric: 'Doanh số',
        value: '1,850',
        description: 'Căn hộ bán thành công trong 10 tháng'
      },
      {
        metric: 'Tăng trưởng leads',
        value: '320%',
        description: 'So với giai đoạn trước khi hợp tác với INLANDV'
      },
      {
        metric: 'ROI Marketing',
        value: '15:1',
        description: 'Mỗi đồng chi cho marketing mang về 15 đồng doanh thu'
      }
    ],
    testimonial: {
      quote: 'Chiến lược và execution của INLANDV đã vượt xa kỳ vọng của chúng tôi. Họ không chỉ là đối tác marketing mà còn là cố vấn chiến lược đáng tin cậy.',
      author: 'Bà Trần Thị Mai',
      role: 'Giám Đốc Marketing',
      company: 'Vinhomes'
    },
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2000',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2000',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2000'
    ],
    tags: ['Căn hộ', 'Marketing 360', 'Smart City', 'Hà Nội']
  },
  {
    id: '3',
    slug: 'trung-tam-logistics-cat-lai',
    projectName: 'Trung Tâm Logistics Cát Lái',
    client: 'Công ty TNHH Logistics Việt Nam',
    industry: 'Logistics & Kho Bãi',
    location: 'TP. Hồ Chí Minh, Việt Nam',
    year: 2023,
    challenge: 'Chủ đầu tư cần tìm kiếm các doanh nghiệp logistics lớn để thuê dài hạn kho bãi tại khu vực Cát Lái - khu vực có nhiều lựa chọn cạnh tranh. Yêu cầu đặc biệt về hợp đồng dài hạn (5-10 năm) và tiêu chuẩn kho hiện đại.',
    solution: 'INLANDV phát triển chiến lược B2B chuyên sâu: (1) Xây dựng cơ sở dữ liệu các công ty logistics có nhu cầu mở rộng kho bãi; (2) Tư vấn nâng cấp cơ sở hạ tầng và tiêu chuẩn kho theo yêu cầu quốc tế (WMS, HACCP); (3) Đàm phán trực tiếp với các tập đoàn logistics lớn; (4) Tư vấn cấu trúc hợp đồng và pháp lý tối ưu cho cả hai bên.',
    results: [
      {
        metric: 'Diện tích cho thuê',
        value: '95%',
        description: '48,000 m² kho đã cho thuê với hợp đồng dài hạn'
      },
      {
        metric: 'Thời gian lấp đầy',
        value: '7 tháng',
        description: 'Nhanh hơn 60% so với kế hoạch ban đầu'
      },
      {
        metric: 'Giá thuê trung bình',
        value: '+22%',
        description: 'Cao hơn mức thị trường nhờ giá trị gia tăng'
      }
    ],
    testimonial: {
      quote: 'INLANDV hiểu rõ nhu cầu thị trường logistics và biết cách kết nối chúng tôi với đúng khách hàng. Sự chuyên nghiệp và hiệu quả của họ đã giúp dự án thành công vượt mong đợi.',
      author: 'Ông Lê Minh Tuấn',
      role: 'Tổng Giám Đốc',
      company: 'Logistics Việt Nam'
    },
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2000',
      'https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=2000',
      'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?q=80&w=2000',
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=2000'
    ],
    tags: ['Logistics', 'Kho bãi', 'B2B', 'TP.HCM']
  }
]

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find(cs => cs.slug === slug)
}

export function getAllCaseStudySlugs(): string[] {
  return caseStudies.map(cs => cs.slug)
}
