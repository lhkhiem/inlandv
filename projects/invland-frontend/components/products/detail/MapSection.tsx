"use client"
import React from 'react'
import { MapPin } from 'lucide-react'
import InfoCard from './InfoCard'
import dynamic from 'next/dynamic'

const LeafletMap = dynamic(() => import('./LeafletMap'), { ssr: false })

interface MapSectionProps {
  latitude?: number
  longitude?: number
  address?: string
}

// Structural only, no map library integration.
export const MapSection: React.FC<MapSectionProps> = ({ latitude, longitude, address }) => {
  const hasCoords = typeof latitude === 'number' && typeof longitude === 'number'
  return (
    <InfoCard title="Vị trí" icon={MapPin}>
      <div className="space-y-3">
        <div className="text-sm font-medium">{address || 'Địa chỉ chưa cập nhật'}</div>
        {hasCoords ? (
          <LeafletMap latitude={latitude!} longitude={longitude!} address={address} />
        ) : (
          <div className="h-64 w-full overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 text-xs">
            Chưa có toạ độ
          </div>
        )}
      </div>
    </InfoCard>
  )
}

export default MapSection
