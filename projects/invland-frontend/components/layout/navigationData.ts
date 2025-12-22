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
        title: "Câu chuyện Inlandv",
        href: "/gioi-thieu?section=cau-chuyen",
      },
      {
        title: "Tại sao nên chọn Inlandv",
        href: "/gioi-thieu?section=tai-sao",
      },
      {
        title: "Đội ngũ lãnh đạo",
        href: "/gioi-thieu?section=doi-ngu",
      },
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
      { title: "Hỗ trợ FDI", href: "/dich-vu?section=fdi" },
      {
        title: "Thiết kế & Thi công",
        href: "/dich-vu?section=thiet-ke-thi-cong",
      },
    ],
  },
  {
    title: "Khu Công Nghiệp",
    href: undefined, // Not clickable, only sub-menus are clickable
    children: [
      {
        title: "Chuyển nhượng đất trong KCN",
        href: undefined, // Sub 1 không click được, chỉ mở sub 2
        children: [
          {
            title: "Chuyển nhượng đất trong KCN",
            href: "/kcn/chuyen-nhuong-trong-kcn",
          },
          {
            title: "Chuyển nhượng đất có NX trong KCN",
            href: "/kcn/chuyen-nhuong-trong-kcn?nx=co",
          },
        ],
      },
      {
        title: "Chuyển nhượng đất ngoài KCN",
        href: undefined, // Sub 1 không click được, chỉ mở sub 2
        children: [
          {
            title: "Chuyển nhượng đất trong CCN",
            href: "/kcn/chuyen-nhuong-ngoai-kcn?scope=trong-ccn",
          },
          {
            title: "Chuyển nhượng đất có NX trong CCN",
            href: "/kcn/chuyen-nhuong-ngoai-kcn?scope=trong-ccn&nx=co",
          },
          {
            title: "Chuyển nhượng đất ngoài KCN / CCN",
            href: "/kcn/chuyen-nhuong-ngoai-kcn?scope=ngoai-kcn-ccn",
          },
          {
            title: "Chuyển nhượng đất có NX ngoài KCN / CCN",
            href: "/kcn/chuyen-nhuong-ngoai-kcn?scope=ngoai-kcn-ccn&nx=co",
          },
        ],
      },
      {
        title: "Cho Thuê",
        href: undefined, // Sub 1 không click được, chỉ mở sub 2
        children: [
          {
            title: "Cho thuê NX trong KCN",
            href: "/kcn/cho-thue?scope=trong-kcn&category=nha-xuong",
          },
          {
            title: "Cho thuê NX trong CCN",
            href: "/kcn/cho-thue?scope=trong-ccn&category=nha-xuong",
          },
          {
            title: "Cho thuê NX ngoài KCN / CCN",
            href: "/kcn/cho-thue?scope=ngoai-kcn-ccn&category=nha-xuong",
          },
          {
            title: "Cho thuê đất trong KCN",
            href: "/kcn/cho-thue?scope=trong-kcn&category=dat",
          },
          {
            title: "Cho thuê đất trong CCN",
            href: "/kcn/cho-thue?scope=trong-ccn&category=dat",
          },
          {
            title: "Cho thuê đất ngoài KCN / CCN",
            href: "/kcn/cho-thue?scope=ngoai-kcn-ccn&category=dat",
          },
        ],
      },
      {
        title: "Đặt hàng",
        href: "/?section=bao-gia-ngay",
      },
    ],
  },
  {
    title: "Bất Động Sản",
    href: "/bat-dong-san",
  },
  {
    title: "Tin Tức",
    href: "/tin-tuc",
    children: [
      {
        title: "Tin thị trường",
        href: "/tin-tuc?category=tin-thi-truong",
      },
      {
        title: "Tin quy hoạch – Chính sách",
        href: "/tin-tuc?category=quy-hoach-chinh-sach",
      },
      {
        title: "Tư vấn hỏi đáp",
        href: "/tin-tuc?category=tu-van-hoi-dap",
      },
      { title: "Tuyển dụng", href: "/tin-tuc?category=tuyen-dung" },
    ],
  },
  { title: "Liên Hệ", href: "/lien-he" },
];
