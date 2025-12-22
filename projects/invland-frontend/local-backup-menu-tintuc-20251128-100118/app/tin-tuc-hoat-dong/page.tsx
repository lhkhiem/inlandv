import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Newspaper, Building2, Users } from "lucide-react";
import NewsActivitySection from "@/components/news-activities/NewsActivitySection";
import ActivitiesSection from "@/components/news-activities/ActivitiesSection";
import ParallaxSection from "@/components/ParallaxSection";
import { getArticlesByCategory } from "@/lib/newsActivitiesData";
import NormalScrollNavigationHandler from "@/components/navigation/NormalScrollNavigationHandler";
export const metadata: Metadata = {
  title: "Tin tức & Hoạt động - INLANDV Real Estate",
  description:
    "Cập nhật tin tức thị trường BĐS công nghiệp, tin tức FDI và các hoạt động của INLANDV.",
};

export default function NewsActivitiesPage() {
  const marketNewsArticles = getArticlesByCategory(
    "thi-truong-bds-cong-nghiep"
  );
  const fdiNewsArticles = getArticlesByCategory("tin-tuc-fdi");

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={null}>
        <NormalScrollNavigationHandler />
      </Suspense>
      {/* Hero Section */}
      <section
        data-bg-type="dark"
        className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 md:py-24"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2000')] bg-cover bg-center opacity-10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              TIN TỨC & HOẠT ĐỘNG
            </h1>
            <div className="w-24 h-1 bg-goldLight mx-auto mb-6" />
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8">
              Cập nhật tin tức thị trường, đầu tư FDI và các hoạt động của
              INLANDV
            </p>

            {/* Quick Navigation */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link
                href="/tin-tuc-hoat-dong?section=thi-truong-bds"
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg transition-all flex items-center gap-2"
              >
                <Newspaper className="w-4 h-4" />
                <span>Thị trường BĐS</span>
              </Link>
              <Link
                href="/tin-tuc-hoat-dong?section=tin-fdi"
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg transition-all flex items-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                <span>Tin tức FDI</span>
              </Link>
              <Link
                href="/tin-tuc-hoat-dong?section=hoat-dong"
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg transition-all flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span>Hoạt động INLANDV</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <div className="bg-white">
        {/* Tin tức thị trường BĐS công nghiệp */}
        <NewsActivitySection
          category="thi-truong-bds-cong-nghiep"
          articles={marketNewsArticles}
          anchorId="thi-truong-bds"
        />

        {/* Divider */}
        <div className="border-t-2 border-gray-100" />

        {/* Tin tức FDI */}
        <NewsActivitySection
          category="tin-tuc-fdi"
          articles={fdiNewsArticles}
          anchorId="tin-fdi"
        />
      </div>

      {/* Hoạt động INLANDV - Special Section */}
      <div id="hoat-dong">
        <ActivitiesSection />
      </div>

      {/* Newsletter Section with Parallax */}
      <ParallaxSection
        backgroundImage="https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2000"
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
                Nhận tin tức mới nhất về thị trường BĐS công nghiệp và hoạt động
                của INLANDV
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
    </div>
  );
}
