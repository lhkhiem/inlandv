"use client"

import { motion } from 'framer-motion'
import { Heart, TrendingUp, Users, Award, GraduationCap, Shield, Coffee, Sparkles } from 'lucide-react'

type HRPolicySectionProps = {
  id: string
  title: string
  content: React.ReactNode
}

export function HRPolicySection({ id, title, content }: HRPolicySectionProps) {
  return (
    <section id={id} className="fullpage-section relative">
      {content}
    </section>
  )
}

export function OverviewSection() {
  return (
    <div className="relative h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-goldDark/20 to-transparent" />
      
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white"
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
          Chính sách Nhân sự
        </h1>
        <p className="text-xl md:text-2xl text-gray-200 mb-8">
          Tại INLAND, con người là tài sản quý giá nhất
        </p>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Chúng tôi tin rằng sự thành công của doanh nghiệp gắn liền với sự phát triển của mỗi cá nhân. 
          Vì vậy, INLAND luôn chú trọng xây dựng môi trường làm việc chuyên nghiệp, chính sách đãi ngộ hấp dẫn 
          và cơ hội phát triển bền vững cho mọi thành viên.
        </p>
      </motion.div>
    </div>
  )
}

export function BenefitsSection() {
  const benefits = [
    {
      icon: Heart,
      title: 'Bảo hiểm & Sức khỏe',
      description: 'BHXH, BHYT, BHTN đầy đủ. Bảo hiểm sức khỏe cao cấp cho nhân viên và gia đình. Khám sức khỏe định kỳ hàng năm.'
    },
    {
      icon: Award,
      title: 'Thưởng & Phúc lợi',
      description: 'Lương tháng 13, thưởng hiệu suất quý, thưởng dự án. Thưởng lễ, tết, sinh nhật. Hỗ trợ cưới hỏi, hiếu hỉ.'
    },
    {
      icon: TrendingUp,
      title: 'Thu nhập hấp dẫn',
      description: 'Mức lương cạnh tranh top đầu thị trường. Hoa hồng không giới hạn cho vị trí kinh doanh. Xét tăng lương định kỳ 6 tháng/lần.'
    },
    {
      icon: Coffee,
      title: 'Work-life Balance',
      description: 'Nghỉ phép năm 12 ngày. Nghỉ phép sinh nhật. Giờ làm việc linh hoạt. Du lịch, team building định kỳ.'
    }
  ]

  return (
    <div className="relative h-full flex items-center bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Chính sách Phúc lợi
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Cam kết mang đến những chế độ đãi ngộ tốt nhất để nhân viên an tâm cống hiến
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-shadow"
            >
              <div className="w-14 h-14 bg-goldDark rounded-xl flex items-center justify-center mb-6">
                <benefit.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {benefit.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function TrainingSection() {
  const programs = [
    {
      icon: GraduationCap,
      title: 'Đào tạo chuyên môn',
      description: 'Chương trình onboarding toàn diện cho nhân viên mới. Đào tạo kiến thức sản phẩm, kỹ năng bán hàng, chăm sóc khách hàng.'
    },
    {
      icon: TrendingUp,
      title: 'Phát triển kỹ năng',
      description: 'Workshop kỹ năng mềm hàng tháng. Khóa học online miễn phí. Hỗ trợ tham gia các khóa đào tạo nâng cao.'
    },
    {
      icon: Users,
      title: 'Mentoring',
      description: 'Chương trình mentor 1-1 cho nhân viên mới. Chia sẻ kinh nghiệm từ các chuyên gia hàng đầu. Hỗ trợ định hướng nghề nghiệp.'
    },
    {
      icon: Sparkles,
      title: 'Thăng tiến rõ ràng',
      description: 'Lộ trình thăng tiến minh bạch. Cơ hội lãnh đạo dự án, quản lý đội nhóm. Ưu tiên thăng chức nội bộ.'
    }
  ]

  return (
    <div className="relative h-full flex items-center bg-gradient-to-br from-goldLight/10 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Đào tạo & Phát triển
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Đầu tư vào con người chính là đầu tư cho tương lai của doanh nghiệp
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {programs.map((program, index) => (
            <motion.div
              key={program.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-goldDark transition-all hover:shadow-lg"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-goldDark to-goldLight rounded-xl flex items-center justify-center mb-6">
                <program.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {program.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {program.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function WorkEnvironmentSection() {
  return (
    <div className="relative h-full flex items-center bg-gray-900">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=2000)' }}
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Môi trường Làm việc
            </h2>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Văn phòng hiện đại, đầy đủ tiện nghi. Không gian làm việc thoải mái, sáng tạo. 
              Văn hóa doanh nghiệp cởi mở, tôn trọng sự khác biệt.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-goldDark flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Chuyên nghiệp</h4>
                  <p className="text-gray-400">Quy trình làm việc chuẩn mực, hiệu quả cao</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Users className="w-6 h-6 text-goldDark flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Đoàn kết</h4>
                  <p className="text-gray-400">Tinh thần đồng đội mạnh mẽ, hỗ trợ lẫn nhau</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Sparkles className="w-6 h-6 text-goldDark flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Sáng tạo</h4>
                  <p className="text-gray-400">Khuyến khích đổi mới, sáng kiến từ mọi cấp độ</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            {['Văn phòng hiện đại', 'Team building', 'Sự kiện', 'Happy hour'].map((item, i) => (
              <div
                key={item}
                className="aspect-square bg-gradient-to-br from-goldDark/20 to-goldLight/20 rounded-2xl flex items-center justify-center border border-goldDark/30 backdrop-blur-sm"
              >
                <span className="text-white font-semibold text-center px-4">{item}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
