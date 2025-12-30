import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Facebook from '@/components/icons/Facebook'
import Wechat from '@/components/icons/Wechat'
import Tiktok from '@/components/icons/Tiktok'

export default function Footer() {
  // Danh sách khu công nghiệp với slug và link chi tiết sản phẩm
  const industrialParks = [
    {
      name: 'Cụm công nghiệp Bình Minh',
      slug: 'cum-cong-nghiep-binh-minh',
      detailLink: '/kcn/cum-cong-nghiep-binh-minh' // Trang chi tiết sản phẩm
    },
    {
      name: 'Khu công nghiệp Hải Long',
      slug: 'khu-cong-nghiep-hai-long',
      detailLink: '/kcn/khu-cong-nghiep-hai-long' // Trang chi tiết sản phẩm
    },
    {
      name: 'Khu công nghiệp số 3 Hưng Yên',
      slug: 'khu-cong-nghiep-so-3-hung-yen',
      detailLink: '/kcn/khu-cong-nghiep-so-3-hung-yen' // Trang chi tiết sản phẩm
    },
    {
      name: 'Khu công nghiệp số 5 Hưng Yên',
      slug: 'khu-cong-nghiep-so-5-hung-yen',
      detailLink: '/kcn/khu-cong-nghiep-so-5-hung-yen' // Trang chi tiết sản phẩm
    },
    {
      name: 'Cụm công nghiệp Quảng Lăng - Đặng Lẽ - Hưng Yên',
      slug: 'cum-cong-nghiep-quang-lang-dang-le-hung-yen',
      detailLink: '/kcn/cum-cong-nghiep-quang-lang-dang-le-hung-yen' // Trang chi tiết sản phẩm
    },
    {
      name: 'Cụm công nghiệp Phạm Ngũ Lão - Nghĩa Dân',
      slug: 'cum-cong-nghiep-pham-ngu-lao-nghia-dan',
      detailLink: '/kcn/cum-cong-nghiep-pham-ngu-lao-nghia-dan' // Trang chi tiết sản phẩm
    },
    {
      name: 'Khu công nghiệp Amata Sông Khoai',
      slug: 'khu-cong-nghiep-amata-song-khoai',
      detailLink: '/kcn/khu-cong-nghiep-amata-song-khoai' // Trang chi tiết sản phẩm
    },
    {
      name: 'Khu công nghiệp Sông Lô 2',
      slug: 'khu-cong-nghiep-song-lo-2',
      detailLink: '/kcn/khu-cong-nghiep-song-lo-2' // Trang chi tiết sản phẩm
    },
    {
      name: 'Khu công nghiệp Tam Dương 1',
      slug: 'khu-cong-nghiep-tam-duong-1',
      detailLink: '/kcn/khu-cong-nghiep-tam-duong-1' // Trang chi tiết sản phẩm
    },
  ]

  // Danh sách hành động đất với links phù hợp từ sub menu 2
  const landActions = [
    {
      text: 'thuê đất kcn',
      link: '/kcn/cho-thue?scope=trong-kcn&category=dat'
    },
    {
      text: 'thuê đất công nghiệp',
      link: '/kcn/cho-thue?scope=trong-kcn&category=dat'
    },
    {
      text: 'thuê đất khu công nghiệp',
      link: '/kcn/cho-thue?scope=trong-kcn&category=dat'
    },
    {
      text: 'mua đất kcn',
      link: '/kcn/chuyen-nhuong-trong-kcn'
    },
    {
      text: 'mua đất công nghiệp',
      link: '/kcn/chuyen-nhuong-trong-kcn'
    },
    {
      text: 'mua đất khu công nghiệp',
      link: '/kcn/chuyen-nhuong-trong-kcn'
    },
    {
      text: 'sang nhượng kcn',
      link: '/kcn/chuyen-nhuong-trong-kcn'
    },
    {
      text: 'sang nhượng đất công nghiệp',
      link: '/kcn/chuyen-nhuong-ngoai-kcn?scope=trong-ccn'
    },
    {
      text: 'sang nhượng đất khu công nghiệp',
      link: '/kcn/chuyen-nhuong-ngoai-kcn?scope=ngoai-kcn-ccn'
    },
  ]

  return (
    <footer className="bg-white text-[#2E8C4F]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-8 md:py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8 lg:gap-12">
          {/* Cột 1: THÔNG TIN LIÊN HỆ */}
          <div>
            {/* Logo */}
            <div className="mb-6">
              <Link href="/" className="block">
                <img
                  src="/logo-1.png"
                  alt="INLANDV Logo"
                  className="h-[4.55rem] w-auto"
                />
              </Link>
            </div>

            {/* Heading */}
            <h3 className="text-goldLight font-heading font-bold text-lg md:text-xl mb-4">
              THÔNG TIN LIÊN HỆ
            </h3>

            {/* Contact Details */}
            <div className="space-y-3 text-sm text-[#2E8C4F]">
              <div className="text-justify">
                <span className="font-semibold">Địa chỉ:</span>{' '}
                <span>
                  A4 Khu nhà ở TM Thuận Việt, 319 Lý Thường Kiệt, Phường Phú Thọ, Thành phố Hồ Chí Minh, Việt Nam
                </span>
              </div>
              <div>
                <span className="font-semibold">Điện thoại:</span>{' '}
                <a href="tel:0896686645" className="hover:text-goldLight transition-colors">
                  0896 686 645
                </a>
              </div>
              <div>
                <span className="font-semibold">Email:</span>{' '}
                <a href="mailto:property.inlandv@gmail.com" className="hover:text-goldLight transition-colors">
                  property.inlandv@gmail.com
                </a>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-6 flex items-center w-full md:justify-between justify-center gap-6 md:gap-0">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#2E8C4F] hover:text-goldLight transition-colors flex-shrink-0"
                aria-label="Facebook"
              >
                <Facebook size={24} />
              </a>
              <a 
                href="https://wechat.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#2E8C4F] hover:text-goldLight transition-colors flex-shrink-0"
                aria-label="WeChat"
              >
                <Wechat size={24} />
              </a>
              <a 
                href="https://tiktok.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#2E8C4F] hover:text-goldLight transition-colors flex-shrink-0"
                aria-label="TikTok"
              >
                <Tiktok size={24} />
              </a>
            </div>
          </div>

          {/* Cột 2: SẢN PHẨM */}
          <div className="mt-0 md:mt-[96.8px]">
            <h3 className="text-goldLight font-heading font-bold text-lg md:text-xl mb-4">
              SẢN PHẨM
            </h3>
            <ul className="space-y-3 text-sm text-[#2E8C4F]">
              <li>
                <Link href="/kcn/chuyen-nhuong-trong-kcn" className="hover:text-goldLight transition-colors">
                  Khu Công Nghiệp
                </Link>
              </li>
              <li>
                <Link href="/bat-dong-san" className="hover:text-goldLight transition-colors">
                  Bất Động Sản
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: DỊCH VỤ */}
          <div className="mt-0 md:mt-[96.8px]">
            <h3 className="text-goldLight font-heading font-bold text-lg md:text-xl mb-4">
              DỊCH VỤ
            </h3>
            <ul className="space-y-3 text-sm text-[#2E8C4F]">
              <li>
                <Link href="/dich-vu?section=moi-gioi" className="hover:text-goldLight transition-colors">
                  Môi giới BĐS Công nghiệp
                </Link>
              </li>
              <li>
                <Link href="/dich-vu?section=phap-ly" className="hover:text-goldLight transition-colors">
                  Tư vấn Pháp lý & Đầu tư
                </Link>
              </li>
              <li>
                <Link href="/dich-vu?section=fdi" className="hover:text-goldLight transition-colors">
                  Hỗ trợ FDI
                </Link>
              </li>
              <li>
                <Link href="/dich-vu?section=thiet-ke-thi-cong" className="hover:text-goldLight transition-colors">
                  Thiết kế & Thi công
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Danh sách KCN/CCN */}
          <div className="bg-white rounded-lg p-3 md:p-4 max-h-[300px] md:max-h-[400px] overflow-y-auto scrollbar-hide mt-0 md:mt-[36.4px]">
            <ul className="space-y-2 text-xs md:text-sm text-[#2E8C4F]">
              {industrialParks.map((park, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <ArrowRight className="w-2.5 h-2.5 text-[#2E8C4F]" />
                  </span>
                  <Link 
                    href={park.detailLink}
                    className="hover:text-goldLight transition-colors"
                  >
                    {park.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 5: Danh sách hành động đất */}
          <div className="bg-white rounded-lg p-3 md:p-4 max-h-[300px] md:max-h-[400px] overflow-y-auto scrollbar-hide mt-0 md:mt-[36.4px]">
            <ul className="space-y-2 text-xs md:text-sm text-[#2E8C4F]">
              {landActions.map((action, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <ArrowRight className="w-2.5 h-2.5 text-[#2E8C4F]" />
                  </span>
                  <Link 
                    href={action.link} 
                    className="hover:text-goldLight transition-colors lowercase"
                  >
                    {action.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#2E8C4F] text-sm">
              © 2025 Inlandv Real Estate. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/dieu-khoan" className="text-[#2E8C4F] hover:text-goldLight transition-colors">
                Điều khoản sử dụng
              </Link>
              <Link href="/chinh-sach" className="text-[#2E8C4F] hover:text-goldLight transition-colors">
                Chính sách bảo mật
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
