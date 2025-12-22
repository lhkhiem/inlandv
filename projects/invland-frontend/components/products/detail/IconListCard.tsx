import React from 'react'
import { CheckCircle } from 'lucide-react'
import clsx from 'clsx'

export interface IconListItem {
  icon?: React.ReactNode
  label: string
  value?: string
}

interface IconListCardProps {
  title: string
  items: IconListItem[]
  columns?: 1 | 2 | 3
}

export const IconListCard: React.FC<IconListCardProps> = ({ title, items, columns = 2 }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3'
  }[columns]
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <h3 className="mb-4 text-lg font-semibold tracking-tight text-gray-900">{title}</h3>
      <div className={clsx('grid gap-3 text-sm', gridCols)}>
        {items.map((it, i) => (
          <div key={i} className="flex gap-3 rounded-lg bg-gray-100 px-4 py-3 border border-gray-200">
            <div className="mt-0.5 text-primary-600 flex-shrink-0">
              {it.icon || <CheckCircle className="h-5 w-5" />}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-gray-900">{it.label}</span>
              {it.value && (
                <span className={clsx(
                  "text-sm font-medium mt-0.5",
                  it.value === 'Có' ? "text-green-700" : "text-gray-500"
                )}>
                  {it.value}
                </span>
              )}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-sm text-gray-500">No data</div>
        )}
      </div>
    </div>
  )
}

export default IconListCard
