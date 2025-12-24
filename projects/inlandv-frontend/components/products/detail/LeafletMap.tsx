"use client"
import React from 'react'
import { parseGoogleMapsLink } from '@/lib/mapUtils'

interface LeafletMapProps {
  latitude?: number
  longitude?: number
  address?: string
  height?: number
  googleMapLink?: string
}

export const LeafletMap: React.FC<LeafletMapProps> = ({ 
  latitude, 
  longitude, 
  address, 
  height = 260,
  googleMapLink 
}) => {
  // If Google Maps link is provided, use it
  if (googleMapLink) {
    const parsed = parseGoogleMapsLink(googleMapLink)
    
    if (parsed.embedUrl) {
      // For short links, we cannot use them directly in iframe
      // Short links need to be converted to embed URL
      // We'll show a message and provide a link to open in new tab
      if (parsed.isShortLink) {
        return (
          <div className="overflow-hidden rounded-lg ring-1 ring-black/10 bg-gray-50 p-4" style={{ height }}>
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-gray-600 text-sm mb-2">
                Short link không thể hiển thị trực tiếp trong iframe
              </p>
              <p className="text-gray-500 text-xs mb-4">
                Vui lòng sử dụng Embed URL từ Google Maps (Share → Embed a map)
              </p>
              <a 
                href={googleMapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline text-sm font-medium"
              >
                Mở bản đồ trên Google Maps →
              </a>
            </div>
          </div>
        )
      }
      
      // For embed URLs, use them directly
      return (
        <div className="overflow-hidden rounded-lg ring-1 ring-black/10" style={{ height }}>
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight={0}
            marginWidth={0}
            src={parsed.embedUrl}
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={address || 'Bản đồ vị trí'}
          />
          <br />
          <small className="text-gray-500 text-xs">
            <a 
              href={googleMapLink.includes('embed') ? googleMapLink.replace('/embed', '').replace('?pb=', '/?pb=') : googleMapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Xem bản đồ lớn hơn trên Google Maps
            </a>
          </small>
        </div>
      )
    }
    
    // If we extracted coordinates from the link, use them
    if (parsed.latitude && parsed.longitude) {
      latitude = parsed.latitude
      longitude = parsed.longitude
    }
  }

  // Fallback to OpenStreetMap if we have coordinates
  if (latitude && longitude) {
    // Use OpenStreetMap embed to avoid React Strict Mode issues
    // Format: https://www.openstreetmap.org/export/embed.html?bbox={minLon},{minLat},{maxLon},{maxLat}&layer=mapnik&marker={lat},{lon}
    
    // Calculate bounding box (roughly 0.01 degrees around the point)
    const bbox = `${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}`
    const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`

    return (
      <div className="overflow-hidden rounded-lg ring-1 ring-black/10" style={{ height }}>
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={embedUrl}
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={address || 'Bản đồ vị trí'}
        />
        <br />
        <small className="text-gray-500 text-xs">
          <a 
            href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Xem bản đồ lớn hơn
          </a>
        </small>
      </div>
    )
  }

  // No map data available
  return (
    <div className="overflow-hidden rounded-lg ring-1 ring-black/10 bg-gray-200 flex items-center justify-center" style={{ height }}>
      <p className="text-gray-500 text-sm">Không có thông tin bản đồ</p>
    </div>
  )
}

export default LeafletMap
