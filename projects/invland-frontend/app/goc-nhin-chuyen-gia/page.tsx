import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { TrendingUp, BookOpen, Building2 } from 'lucide-react'
import InsightSection from '@/components/insights/InsightSection'
import ParallaxSection from '@/components/ParallaxSection'
import { getArticlesByCategory } from '@/lib/insightsData'
import NormalScrollNavigationHandler from '@/components/navigation/NormalScrollNavigationHandler'

export const metadata: Metadata = {
  title: 'Góc nhìn chuyên gia - INLANDV Real Estate',
  description: 'Chia sẻ kiến thức, xây dựng uy tín, thu hút traffic SEO. Phân tích thị trường BĐS công nghiệp Việt Nam, cẩm nang đầu tư BĐS cho FDI.',
}

export default function InsightsBlogPage() {
  const marketAnalysisArticles = getArticlesByCategory('phan-tich-thi-truong')
  const investmentGuideArticles = getArticlesByCategory('cam-nang-dau-tu')
  const fdiNewsArticles = getArticlesByCategory('tin-tuc-fdi')

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={null}>
        <NormalScrollNavigationHandler />
      </Suspense>
      {/* Hero Section */}
      <section data-bg-type="dark" className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 md:py-24">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000')] bg-cover bg-center opacity-10" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              GÓC NHÌN CHUYÊN GIA
            </h1>
            <div className="w-24 h-1 bg-goldLight mx-auto mb-6" />
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8">
              Chia sẻ kiến thức, xây dựng uy tín, thu hút traffic SEO
            </p>
            
            {/* Quick Navigation */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link 
                href="/goc-nhin-chuyen-gia?section=phan-tich-thi-truong"
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg transition-all flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Phân tích thị trường</span>
              </Link>
              <Link 
                href="/goc-nhin-chuyen-gia?section=cam-nang-dau-tu"
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg transition-all flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Cẩm nang đầu tư</span>
              </Link>
              <Link 
                href="/goc-nhin-chuyen-gia?section=tin-tuc-fdi"
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg transition-all flex items-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                <span>Tin tức FDI</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <div className="bg-white">
        {/* Phân tích thị trường */}
        <InsightSection 
          category="phan-tich-thi-truong"
          articles={marketAnalysisArticles}
          anchorId="phan-tich-thi-truong"
        />

        {/* Divider */}
        <div className="border-t-2 border-gray-100" />

        {/* Cẩm nang đầu tư */}
        <InsightSection 
          category="cam-nang-dau-tu"
          articles={investmentGuideArticles}
          anchorId="cam-nang-dau-tu"
        />

        {/* Divider */}
        <div className="border-t-2 border-gray-100" />

        {/* Tin tức FDI */}
        <InsightSection 
          category="tin-tuc-fdi"
          articles={fdiNewsArticles}
          anchorId="tin-tuc-fdi"
        />
      </div>

      {/* Newsletter Section with Parallax */}
      <ParallaxSection 
        backgroundImage="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000"
        overlay={true}
        overlayOpacity={0.92}
        className="py-20 md:py-28"
        contentClassName="px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto w-full">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-12 border border-gray-200">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Đăng ký nhận tin tức
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Nhận các phân tích, tin tức và cẩm nang đầu tư mới nhất từ đội ngũ chuyên gia INLANDV
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="flex-1 px-5 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-goldDark focus:border-transparent bg-white"
                />
                <button className="px-8 py-4 bg-goldDark text-black font-bold rounded-lg hover:bg-goldLight transition-colors whitespace-nowrap shadow-md hover:shadow-lg">
                  Đăng ký ngay
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Chúng tôi tôn trọng quyền riêng tư của bạn. Không spam.
              </p>
            </div>
          </div>
        </div>
      </ParallaxSection>

      {/* CTA Section */}
      {/* CTA Section */}
      <section data-bg-type="dark" className="py-16 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tìm kiếm bất động sản công nghiệp phù hợp?
            </h2>
            <p className="text-xl text-gray-300">
              INLANDV sẵn sàng tư vấn giải pháp tối ưu cho doanh nghiệp của bạn
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Link 
              href="/bat-dong-san"
              className="group bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl p-8 hover:bg-goldDark hover:border-goldDark transition-all"
            >
              <h3 className="text-2xl font-bold mb-3 group-hover:text-black">
                Bất động sản công nghiệp
              </h3>
              <p className="text-gray-300 mb-4 group-hover:text-black/80">
                Khám phá các dự án BĐS công nghiệp chất lượng cao
              </p>
              <span className="inline-flex items-center gap-2 text-goldLight group-hover:text-black font-semibold">
                Xem ngay →
              </span>
            </Link>
            
            <Link 
              href="/kcn"
              className="group bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl p-8 hover:bg-goldDark hover:border-goldDark transition-all"
            >
              <h3 className="text-2xl font-bold mb-3 group-hover:text-black">
                Khu công nghiệp
              </h3>
              <p className="text-gray-300 mb-4 group-hover:text-black/80">
                Tìm KCN phù hợp với nhu cầu đầu tư của bạn
              </p>
              <span className="inline-flex items-center gap-2 text-goldLight group-hover:text-black font-semibold">
                Xem ngay →
              </span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
