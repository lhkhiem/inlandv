// Navigation tree structure matching provided sitemap
// Each item can have children; route paths are placeholders where not specified

export interface NavItem {
  title: string;
  href?: string;
  children?: NavItem[];
}

export const navigationTree: NavItem[] = [
  { title: "Trang chủ", href: "/" },
  {
    title: "Về Chúng Tôi",
    href: "/gioi-thieu",
    children: [
      {
        title: "Câu chuyện INLANDV (Xuất phát)",
        href: "/gioi-thieu?section=xuat-phat",
      },
      { title: "Sứ mệnh & Tầm nhìn", href: "/gioi-thieu?section=tam-nhin" },
      { title: "Giới thiệu CEO", href: "/gioi-thieu?section=gioi-thieu" },
      { title: "Đội ngũ (Key Team)", href: "/gioi-thieu?section=doi-ngu" },
      { title: "Cơ cấu tổ chức", href: "/gioi-thieu?section=to-chuc" },
      {
        title: "Khách hàng & Đối tác tiêu biểu",
        href: "/gioi-thieu?section=khach-hang",
      },
    ],
  },
  {
    title: "Dịch vụ",
    href: "/dich-vu",
    children: [
      { title: "Môi giới BĐS Công nghiệp", href: "/dich-vu?section=moi-gioi" },
      { title: "Tư vấn Pháp lý & Đầu tư", href: "/dich-vu?section=phap-ly" },
      { title: "Dịch vụ Hỗ trợ FDI", href: "/dich-vu?section=fdi" },
      {
        title: "Thiết kế & Thi công",
        href: "/dich-vu?section=thiet-ke-thi-cong",
      },
    ],
  },
  {
    title: "Bất động sản",
    href: "/bat-dong-san",
  },
  {
    title: "Khu công nghiệp",
    href: "/kcn",
  },
  {
    title: "Góc nhìn chuyên gia",
    href: "/goc-nhin-chuyen-gia",
    children: [
      {
        title: "Phân tích thị trường",
        href: "/goc-nhin-chuyen-gia?section=phan-tich-thi-truong",
      },
      {
        title: "Cẩm nang đầu tư",
        href: "/goc-nhin-chuyen-gia?section=cam-nang-dau-tu",
      },
      {
        title: "Tin tức FDI",
        href: "/goc-nhin-chuyen-gia?section=tin-tuc-fdi",
      },
    ],
  },
  {
    title: "Tin tức & Hoạt động",
    href: "/tin-tuc-hoat-dong",
    children: [
      {
        title: "Tin tức Thị trường BĐS Công nghiệp",
        // href: "/tin-tuc-hoat-dong/thi-truong-bds-cong-nghiep",
        href: "/tin-tuc-hoat-dong?section=thi-truong-bds",
      },
      { title: "Tin tức FDI", href: "/tin-tuc-hoat-dong?section=tin-fdi" },
      {
        title: "Hoạt động Inlandv",
        href: "/tin-tuc-hoat-dong?section=hoat-dong",
        children: [
          {
            title: "Sự kiện đã tham gia",
            href: "/tin-tuc-hoat-dong?section=hoat-dong",
          },
          {
            title: "Hoạt động CSR",
            href: "/tin-tuc-hoat-dong?section=hoat-dong",
          },
          {
            title: "Dự án mới triển khai",
            href: "/tin-tuc-hoat-dong?section=hoat-dong",
          },
        ],
      },
    ],
  },
  { title: "Tuyển dụng", href: "/tuyen-dung" },
  { title: "Case Studies", href: "/case-studies" },
  { title: "Liên hệ", href: "/lien-he" },
];
