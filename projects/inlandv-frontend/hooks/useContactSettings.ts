import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface ContactSettings {
  address?: string
  hotline?: string
  email?: string
  googleMapLink?: string
  latitude?: number
  longitude?: number
}

const defaultContactSettings: ContactSettings = {
  hotline: '0896 686 645',
  email: 'property.inlandv@gmail.com',
  address: 'Tầng 12, Tòa nhà ABC, 123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
}

export function useContactSettings() {
  const [settings, setSettings] = useState<ContactSettings>(defaultContactSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        let contactSettings: ContactSettings = {}
        
        // Try to fetch from 'contact' namespace first
        try {
          const contactResponse = await api.getSettingByNamespace('contact')
          if (contactResponse.success && contactResponse.data) {
            const value = contactResponse.data.value || contactResponse.data
            if (value && typeof value === 'object') {
              const hasData = Object.keys(value).length > 0 && (
                value.address || value.hotline || value.email || 
                value.phone || value.businessInfo?.phone || value.latitude || value.longitude
              )
              if (hasData) {
                contactSettings = {
                  address: value.businessInfo?.address || value.address,
                  hotline: value.businessInfo?.phone || value.hotline || value.phone,
                  email: value.businessInfo?.email || value.email,
                  googleMapLink: value.businessInfo?.googleMapLink || value.businessInfo?.google_maps_link || value.googleMapLink || value.google_maps_link,
                  latitude: value.businessInfo?.latitude || value.latitude,
                  longitude: value.businessInfo?.longitude || value.longitude,
                }
              }
            }
          }
        } catch (e) {
          // If 'contact' namespace doesn't exist, try 'general'
          try {
            const generalResponse = await api.getSettingByNamespace('general')
            if (generalResponse.success && generalResponse.data) {
              const general = generalResponse.data.value || generalResponse.data
              if (general && typeof general === 'object') {
                contactSettings = {
                  address: general.businessInfo?.address || general.address,
                  hotline: general.businessInfo?.phone || general.hotline || general.phone,
                  email: general.businessInfo?.email || general.email,
                  googleMapLink: general.businessInfo?.googleMapLink || general.businessInfo?.google_maps_link || general.googleMapLink || general.google_maps_link,
                  latitude: general.businessInfo?.latitude || general.latitude,
                  longitude: general.businessInfo?.longitude || general.longitude,
                }
              }
            }
          } catch (e2) {
            console.warn('Failed to fetch contact settings from both namespaces')
          }
        }

        const finalSettings = {
          hotline: contactSettings.hotline || defaultContactSettings.hotline,
          email: contactSettings.email || defaultContactSettings.email,
          address: contactSettings.address || defaultContactSettings.address,
          googleMapLink: contactSettings.googleMapLink,
          latitude: contactSettings.latitude,
          longitude: contactSettings.longitude,
        }
        
        // Debug log
        if (process.env.NODE_ENV === 'development') {
          console.log('[useContactSettings] Fetched settings:', {
            contactSettings,
            finalSettings,
            hasHotline: !!contactSettings.hotline,
          })
        }
        
        setSettings(finalSettings)
      } catch (error) {
        console.error('Failed to fetch contact settings:', error)
        setSettings(defaultContactSettings)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  return { settings, loading }
}






