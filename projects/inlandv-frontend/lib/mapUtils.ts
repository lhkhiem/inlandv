/**
 * Utility functions for handling Google Maps links and coordinates
 */

/**
 * Convert Google Maps share link to embed URL
 * Supports 2 main formats:
 * 1. Embed URL: https://www.google.com/maps/embed?pb=... (best - use this from Google Maps Share > Embed)
 * 2. Short link: https://maps.app.goo.gl/... (will be converted to iframe with redirect)
 */
export function parseGoogleMapsLink(url: string): {
  embedUrl?: string
  latitude?: number
  longitude?: number
  isShortLink?: boolean
} {
  if (!url) return {}

  try {
    // Clean up URL - remove iframe tags if present
    let cleanUrl = url.trim()
    if (cleanUrl.includes('<iframe')) {
      // Extract src from iframe
      const srcMatch = cleanUrl.match(/src=["']([^"']+)["']/)
      if (srcMatch) {
        cleanUrl = srcMatch[1]
      }
    }

    // If it's already an embed URL, return as is (best case)
    if (cleanUrl.includes('/maps/embed') || cleanUrl.includes('maps/embed?pb=')) {
      return { embedUrl: cleanUrl }
    }

    // Handle short links: https://maps.app.goo.gl/...
    if (cleanUrl.includes('maps.app.goo.gl/') || cleanUrl.includes('goo.gl/maps/')) {
      // Short links cannot be used directly in iframe embed
      // They need to be converted to embed URL
      // The best approach is to use Google's URL shortener API or follow redirect
      // For now, we'll return the short link and show a message to user
      // In production, you might want to create a backend endpoint to resolve short links
      
      // Try to extract the short code
      const shortCodeMatch = cleanUrl.match(/(?:maps\.app\.goo\.gl|goo\.gl\/maps)\/([A-Za-z0-9_-]+)/)
      if (shortCodeMatch) {
        // Return short link with flag - component will handle it
        // Note: Short links need to be resolved server-side or user should use embed URL
        return { 
          embedUrl: cleanUrl,
          isShortLink: true 
        }
      }
    }

    // Try to extract coordinates from various Google Maps URL formats
    try {
      const urlObj = new URL(cleanUrl)

      // Format: https://maps.google.com/?q=lat,lng
      // Format: https://www.google.com/maps?q=lat,lng
      if (urlObj.searchParams.has('q')) {
        const q = urlObj.searchParams.get('q')
        if (q) {
          // Try to parse as coordinates (lat,lng)
          const coords = q.split(',')
          if (coords.length >= 2) {
            const lat = parseFloat(coords[0].trim())
            const lng = parseFloat(coords[1].trim())
            if (!isNaN(lat) && !isNaN(lng)) {
              // Convert to embed URL using a simple format
              const embedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${Math.floor(lat)}!5e0!3m2!1sen!2s!4v1!5m2!1sen!2s`
              return { embedUrl, latitude: lat, longitude: lng }
            }
          }
        }
      }

      // Format: https://maps.google.com/?ll=lat,lng
      if (urlObj.searchParams.has('ll')) {
        const ll = urlObj.searchParams.get('ll')
        if (ll) {
          const coords = ll.split(',')
          if (coords.length >= 2) {
            const lat = parseFloat(coords[0].trim())
            const lng = parseFloat(coords[1].trim())
            if (!isNaN(lat) && !isNaN(lng)) {
              const embedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${Math.floor(lat)}!5e0!3m2!1sen!2s!4v1!5m2!1sen!2s`
              return { embedUrl, latitude: lat, longitude: lng }
            }
          }
        }
      }

      // Format: https://www.google.com/maps/place/.../@lat,lng,zoom
      if (urlObj.pathname.includes('/place/')) {
        const pathMatch = urlObj.pathname.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
        if (pathMatch) {
          const lat = parseFloat(pathMatch[1])
          const lng = parseFloat(pathMatch[2])
          if (!isNaN(lat) && !isNaN(lng)) {
            const embedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${Math.floor(lat)}!5e0!3m2!1sen!2s!4v1!5m2!1sen!2s`
            return { embedUrl, latitude: lat, longitude: lng }
          }
        }
      }
    } catch (urlError) {
      // URL parsing failed, might be a malformed URL
      console.warn('Failed to parse URL:', urlError)
    }

    // If we can't parse it, return empty
    console.warn('Google Maps link format not recognized. Please use embed URL (Share > Embed a map) or short link (maps.app.goo.gl)')
    return {}
  } catch (error) {
    console.warn('Failed to parse Google Maps link:', error)
  }

  return {}
}

/**
 * Extract coordinates from Google Maps link
 */
export function extractCoordinatesFromGoogleMaps(url: string): {
  latitude?: number
  longitude?: number
} {
  const parsed = parseGoogleMapsLink(url)
  return {
    latitude: parsed.latitude,
    longitude: parsed.longitude,
  }
}

