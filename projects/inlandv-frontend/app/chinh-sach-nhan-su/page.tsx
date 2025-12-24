"use client"

import { useState } from 'react'
import FullpageScroll from '@/components/FullpageScroll'
import CareersTabs from '@/components/careers/CareersTabs'
import {
  HRPolicySection,
  OverviewSection,
  BenefitsSection,
  TrainingSection,
  WorkEnvironmentSection
} from '@/components/careers/HRPolicySection'

export default function ChinhSachNhanSuPage() {
  const sections = [
    { id: 'tong-quan', index: 0, title: 'Tổng quan', backgroundType: 'light' as const },
    { id: 'phuc-loi', index: 1, title: 'Chính sách phúc lợi', backgroundType: 'light' as const },
    { id: 'dao-tao', index: 2, title: 'Đào tạo & phát triển', backgroundType: 'light' as const },
    { id: 'moi-truong', index: 3, title: 'Môi trường làm việc', backgroundType: 'light' as const }
  ]

  return (
    <>
      <CareersTabs />
      
      <FullpageScroll
        sections={sections}
      >
        <HRPolicySection id="tong-quan" title="Tổng quan" content={<OverviewSection />} />
        <HRPolicySection id="phuc-loi" title="Chính sách phúc lợi" content={<BenefitsSection />} />
        <HRPolicySection id="dao-tao" title="Đào tạo & phát triển" content={<TrainingSection />} />
        <HRPolicySection id="moi-truong" title="Môi trường làm việc" content={<WorkEnvironmentSection />} />
      </FullpageScroll>
    </>
  )
}
