'use client'

import { motion } from 'framer-motion'
import { Building2, Users, TrendingUp, Award } from 'lucide-react'
import { useSectionReveal } from '@/hooks/useSectionReveal'

export default function CompanyIntro() {
  const revealed = useSectionReveal(3) // Section index in gioi-thieu page
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-white">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center h-full">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={revealed ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="inline-block px-4 py-2 bg-goldLight/10 rounded-full mb-4">
              <span className="text-goldDark text-sm font-semibold tracking-wide uppercase">
                Về công ty
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Inland Real Estate
              <br />
              <span className="text-goldDark">Đối Tác Tin Cậy</span>
            </h2>

            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                <strong className="text-goldDark">Inland Real Estate</strong> là một trong những sàn giao dịch 
                bất động sản hàng đầu Việt Nam với hơn 15 năm kinh nghiệm trong lĩnh vực phát triển, 
                tư vấn và phân phối các dự án bất động sản cao cấp.
              </p>

              <p>
                Chúng tôi tự hào là cầu nối giữa các chủ đầu tư uy tín và hàng nghìn khách hàng 
                trên khắp cả nước, mang đến những cơ hội đầu tư sinh lời bền vững và an cư lý tưởng 
                cho mọi gia đình Việt.
              </p>

              <p>
                Với đội ngũ chuyên gia giàu kinh nghiệm, mạng lưới đối tác rộng khắp và cam kết 
                minh bạch trong mọi giao dịch, <strong className="text-goldDark">Inland</strong> không 
                ngừng nỗ lực để trở thành người đồng hành đáng tin cậy nhất trong hành trình 
                đầu tư bất động sản của bạn.
              </p>
            </div>

            {/* Key Highlights */}
            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-goldLight/20 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-goldDark" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">200+ Dự án</div>
                  <div className="text-sm text-gray-600">Thành công</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-goldLight/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-goldDark" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">5000+ Khách hàng</div>
                  <div className="text-sm text-gray-600">Tin tưởng</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-goldLight/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-goldDark" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Top 10</div>
                  <div className="text-sm text-gray-600">Sàn BĐS uy tín</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-goldLight/20 flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-goldDark" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">15+ Năm</div>
                  <div className="text-sm text-gray-600">Kinh nghiệm</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={revealed ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: revealed ? 0.2 : 0 }}
            className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-goldDark/20 to-transparent z-10" />
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            
            {/* Decorative element */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-lg z-20">
              <div className="text-goldDark font-bold text-lg mb-1">
                Cam kết chất lượng
              </div>
              <div className="text-gray-700 text-sm">
                Mọi giao dịch đều được đảm bảo minh bạch, pháp lý rõ ràng và hỗ trợ tận tâm
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
