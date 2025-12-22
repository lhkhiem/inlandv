import React from 'react'
import { LucideIcon } from 'lucide-react'
import clsx from 'clsx'

interface InfoCardProps {
  title: string
  icon?: LucideIcon
  children?: React.ReactNode
  className?: string
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, icon: Icon, children, className }) => {
  return (
    <div className={clsx('rounded-xl bg-[#1f1b1b] p-6 shadow-sm ring-1 ring-black/40 text-gray-100', className)}>
      <div className="mb-4 flex items-center gap-3">
        {Icon && <Icon className="h-5 w-5 text-primary" />}
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      </div>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  )
}

export default InfoCard
