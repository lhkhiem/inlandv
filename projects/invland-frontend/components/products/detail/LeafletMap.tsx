"use client"
import React from 'react'

interface LeafletMapProps {
  latitude: number
  longitude: number
  address?: string
  height?: number
}

export const LeafletMap: React.FC<LeafletMapProps> = ({ latitude, longitude, address, height = 260 }) => {
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

export default LeafletMap
