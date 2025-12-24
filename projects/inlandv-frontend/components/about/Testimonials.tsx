'use client'

import { motion } from 'framer-motion'
import { Quote, Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Anh Nguyễn Văn Minh',
    role: 'Chủ đầu tư cá nhân',
    avatar: 'https://i.pravatar.cc/150?img=12',
    rating: 5,
    feedback: 'Inland đã giúp tôi tìm được căn hộ mơ ước với giá tốt nhất. Đội ngũ tư vấn rất chuyên nghiệp và tận tâm. Tôi hoàn toàn hài lòng với dịch vụ!'
  },
  {
    name: 'Chị Trần Thị Hương',
    role: 'Doanh nhân',
    avatar: 'https://i.pravatar.cc/150?img=5',
    rating: 5,
    feedback: 'Tôi đã đầu tư nhiều dự án thông qua Inland. Mọi giao dịch đều minh bạch, pháp lý rõ ràng. Đây thực sự là đối tác đáng tin cậy cho các nhà đầu tư.'
  },
  {
    name: 'Anh Lê Hoàng Nam',
    role: 'Kỹ sư IT',
    avatar: 'https://i.pravatar.cc/150?img=33',
    rating: 5,
    feedback: 'Lần đầu mua nhà nhưng được Inland hỗ trợ rất kỹ từ A-Z. Từ tìm kiếm, thẩm định pháp lý đến hoàn tất thủ tục sổ hồng. Rất chuyên nghiệp!'
  }
]

export default function Testimonials() {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-white">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-block px-4 py-2 bg-goldLight/10 rounded-full mb-4">
            <span className="text-goldDark text-sm font-semibold tracking-wide uppercase">
              Khách hàng nói gì
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Đánh Giá
            <br />
            <span className="text-goldDark">Từ Khách Hàng</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hàng nghìn khách hàng đã tin tưởng và hài lòng với dịch vụ của Inland
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl hover:border-goldLight/30 transition-all duration-300 h-full flex flex-col">
                {/* Quote icon */}
                <div className="absolute top-6 right-6 w-12 h-12 bg-goldLight/10 rounded-full flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                  <Quote className="w-6 h-6 text-goldDark" />
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-goldDark text-goldDark" />
                  ))}
                </div>

                {/* Feedback */}
                <p className="text-gray-700 leading-relaxed mb-6 flex-grow italic">
                  &ldquo;{testimonial.feedback}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-goldLight/30">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Online indicator */}
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>

                {/* Decorative gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-goldDark/5 to-goldLight/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600 mb-4">
            Đánh giá trung bình: <span className="font-bold text-goldDark text-xl">4.9/5.0</span> từ hơn 5000+ khách hàng
          </p>
          <button className="px-6 py-3 bg-gradient-to-r from-goldDark to-goldLight text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
            Xem thêm đánh giá
          </button>
        </motion.div>
      </div>
    </section>
  )
}
