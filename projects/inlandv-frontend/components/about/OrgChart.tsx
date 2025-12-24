'use client'

import { motion } from 'framer-motion'
import { Building2, Users2, UserCircle2, Briefcase } from 'lucide-react'
import { useSectionReveal } from '@/hooks/useSectionReveal'

const orgData = [
  {
    level: 1,
    title: 'Ban Giám Đốc',
    icon: Building2,
    members: ['Tổng Giám Đốc', 'Phó Giám Đốc'],
    color: 'from-goldDark to-goldLight'
  },
  {
    level: 2,
    departments: [
      {
        title: 'Phòng Kinh Doanh',
        icon: Briefcase,
        members: ['200+ Chuyên viên'],
        color: 'from-goldDark/80 to-goldLight/80'
      },
      {
        title: 'Phòng Marketing',
        icon: Users2,
        members: ['20+ Chuyên gia'],
        color: 'from-goldDark/80 to-goldLight/80'
      },
      {
        title: 'Phòng Pháp lý',
        icon: UserCircle2,
        members: ['15+ Luật sư'],
        color: 'from-goldDark/80 to-goldLight/80'
      }
    ]
  }
]

export default function OrgChart() {
  const revealed = useSectionReveal(5) // Section index in gioi-thieu page

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-white">
      <div className="w-full max-w-[1600px] mx-auto px-8 sm:px-12 md:px-16 lg:px-20 py-6 md:py-8 max-h-[85vh] overflow-y-auto scrollbar-hide flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4 md:mb-6"
        >
          <div className="inline-block px-3 py-1 bg-goldLight/10 rounded-full mb-2">
            <span className="text-goldDark text-sm font-semibold tracking-wide uppercase">
              Cơ cấu tổ chức
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Sơ Đồ
            <br />
            <span className="text-goldDark">Tổ Chức</span>
          </h2>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            Đội ngũ chuyên nghiệp với cơ cấu tổ chức rõ ràng và hiệu quả
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {/* Level 1: Leadership */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
            transition={{ duration: 0.6, delay: revealed ? 0.2 : 0 }}
            className="flex justify-center mb-6 md:mb-8"
          >
            <div className="relative">
              <div className={`
                w-64 md:w-72 bg-gradient-to-br ${orgData[0].color} rounded-2xl p-6 md:p-8 shadow-xl
                border-2 border-goldLight/30
              `}>
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-goldDark" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white text-center mb-3">
                  {orgData[0].title}
                </h3>
                <div className="space-y-1">
                  {orgData[0].members?.map((member, idx) => (
                    <div key={idx} className="text-center text-white/90 text-sm font-medium">
                      {member}
                    </div>
                  ))}
                </div>
              </div>

              {/* Connection line */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-1 h-8 md:h-10 bg-gradient-to-b from-goldLight to-transparent" />
            </div>
          </motion.div>

          {/* Level 2: Departments */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: revealed ? 0.4 : 0 }}
            className="grid md:grid-cols-3 gap-4 md:gap-6"
          >
            {orgData[1].departments?.map((dept, index) => {
              const DeptIcon = dept.icon
              return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={revealed ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: revealed ? 0.6 + index * 0.1 : 0 }}
                className="relative"
              >
                {/* Connection line to parent */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full w-1 h-8 md:h-10 bg-gradient-to-b from-transparent to-goldLight/30" />

                <div className={`
                  bg-gradient-to-br ${dept.color} rounded-2xl p-5 md:p-6 shadow-lg
                  border border-goldLight/20 hover:shadow-xl transition-shadow
                `}>
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center">
                      <DeptIcon className="w-7 h-7 text-goldDark" />
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-white text-center mb-3">
                    {dept.title}
                  </h4>
                  <div className="space-y-1">
                    {dept.members.map((member, idx) => (
                      <div key={idx} className="text-center text-white/90 text-sm font-medium">
                        {member}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )})}
          </motion.div>
        </div>

        {/* Additional info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={revealed ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: revealed ? 0.8 : 0 }}
          className="mt-6 md:mt-8 text-center"
        >
          <p className="text-gray-600 text-sm">
            Tổng số nhân sự: <span className="font-bold text-goldDark">235+ thành viên</span> chuyên nghiệp
          </p>
        </motion.div>
      </div>
    </section>
  )
}
