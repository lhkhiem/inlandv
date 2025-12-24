'use client'

import React from 'react'

interface ParallaxSectionProps {
  backgroundImage: string
  children: React.ReactNode
  className?: string
  contentClassName?: string
  overlay?: boolean
  overlayOpacity?: number
}

// CSS parallax with overlay support
export function ParallaxSection({
  backgroundImage,
  children,
  className = '',
  contentClassName = '',
  overlay = false,
  overlayOpacity = 0.9,
}: ParallaxSectionProps) {
  return (
    <section
      className={`parallax-section relative overflow-hidden bg-center bg-no-repeat bg-cover bg-scroll lg:bg-fixed min-h-[40vh] ${className}`}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Optional overlay */}
      {overlay && (
        <div 
          className="absolute inset-0 bg-white z-[1]"
          style={{ opacity: overlayOpacity }}
        />
      )}
      
      <div className={`parallax-inner relative z-10 flex flex-col justify-center items-center w-full ${contentClassName}`}>
        {children}
      </div>
    </section>
  )
}

export default ParallaxSection
