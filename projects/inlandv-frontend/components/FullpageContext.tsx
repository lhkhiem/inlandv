'use client'

import React, { createContext, useContext, useState } from 'react'

export type BackgroundType = 'light' | 'image' | 'dark'

type Ctx = {
  backgroundType: BackgroundType
  setBackgroundType: (t: BackgroundType) => void
  currentSection: number
  totalSections: number
  isInFooterZone: boolean
}

const FullpageContext = createContext<Ctx | undefined>(undefined)

// Internal context for FullpageScroll to update values
const FullpageInternalContext = createContext<{
  setCurrentSection: (section: number) => void
  setTotalSections: (total: number) => void
  setIsInFooterZone: (inFooter: boolean) => void
} | undefined>(undefined)

export function FullpageProvider({ children }: { children: React.ReactNode }) {
  const [backgroundType, setBackgroundType] = useState<BackgroundType>('light')
  const [currentSection, setCurrentSection] = useState(0)
  const [totalSections, setTotalSections] = useState(0)
  const [isInFooterZone, setIsInFooterZone] = useState(false)
  
  return (
    <FullpageContext.Provider value={{ 
      backgroundType, 
      setBackgroundType,
      currentSection,
      totalSections,
      isInFooterZone
    }}>
      <FullpageInternalContext.Provider value={{
        setCurrentSection,
        setTotalSections,
        setIsInFooterZone
      }}>
        {children}
      </FullpageInternalContext.Provider>
    </FullpageContext.Provider>
  )
}

export function useFullpage() {
  const ctx = useContext(FullpageContext)
  if (!ctx) throw new Error('useFullpage must be used within FullpageProvider')
  return ctx
}

export function useFullpageInternal() {
  const ctx = useContext(FullpageInternalContext)
  if (!ctx) throw new Error('useFullpageInternal must be used within FullpageProvider')
  return ctx
}
