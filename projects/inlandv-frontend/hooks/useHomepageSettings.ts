import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface HomepageSettings {
  heroTitle?: string
  heroSlogan?: string
  heroSubtitle?: string
}

const defaultHomepageSettings: HomepageSettings = {
  heroTitle: 'INLANDV',
  heroSlogan: 'Cầu Nối Thịnh Vượng – Dẫn Bước Thành Công',
}

export function useHomepageSettings() {
  const [settings, setSettings] = useState<HomepageSettings>(defaultHomepageSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        let homepageSettings: HomepageSettings = {}
        
        // Try to fetch from 'homepage' namespace first
        try {
          const response = await api.getSettingByNamespace('homepage')
          if (response.success && response.data) {
            const value = response.data.value || response.data
            if (value && typeof value === 'object') {
              homepageSettings = {
                heroTitle: value.heroTitle || value.title,
                heroSlogan: value.heroSlogan || value.slogan,
                heroSubtitle: value.heroSubtitle || value.subtitle,
              }
            }
          }
        } catch (e) {
          // If 'homepage' namespace doesn't exist, try 'general'
          try {
            const generalResponse = await api.getSettingByNamespace('general')
            if (generalResponse.success && generalResponse.data) {
              const general = generalResponse.data.value || generalResponse.data
              if (general && typeof general === 'object') {
                homepageSettings = {
                  heroTitle: general.homepageTitle || general.heroTitle || general.title,
                  heroSlogan: general.homepageSlogan || general.heroSlogan || general.slogan,
                  heroSubtitle: general.homepageSubtitle || general.heroSubtitle,
                }
              }
            }
          } catch (e2) {
            console.warn('Failed to fetch homepage settings from both namespaces')
          }
        }

        setSettings({
          heroTitle: homepageSettings.heroTitle || defaultHomepageSettings.heroTitle,
          heroSlogan: homepageSettings.heroSlogan || defaultHomepageSettings.heroSlogan,
          heroSubtitle: homepageSettings.heroSubtitle,
        })
      } catch (error) {
        console.error('Failed to fetch homepage settings:', error)
        setSettings(defaultHomepageSettings)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  return { settings, loading }
}















