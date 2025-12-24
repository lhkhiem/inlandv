'use client';

import { useState, useEffect } from 'react';

/**
 * Uniform Canvas Scaler Algorithm for Web
 * 
 * Reference Canvas Scaling Model - scales content uniformly
 * based on viewport dimensions relative to reference canvas (1920×1080 FullHD)
 * 
 * Formula: scaleFactor = min(viewportWidth / referenceWidth, viewportHeight / referenceHeight)
 * This ensures uniform scaling that preserves aspect ratio and prevents distortion
 * 
 * @param referenceWidth - Reference width (default: 1920px FullHD 23")
 * @param referenceHeight - Reference height (default: 1080px)
 * @param minScale - Minimum scale factor (default: 0.5)
 * @param maxScale - Maximum scale factor (default: 2.0)
 */
export function useCanvasScale(
  referenceWidth: number = 1920,
  referenceHeight: number = 1080,
  minScale: number = 0.5,
  maxScale: number = 2.0
) {
  const [scale, setScale] = useState(1);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function updateScale() {
      if (typeof window === 'undefined') return;
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setViewport({ width, height });

      // Only scale in landscape mode
      // Portrait mode: no scaling (scale = 1)
      if (height > width) {
        setScale(1);
        return;
      }

      // UNIFORM SCALING: min(width ratio, height ratio)
      // This ensures the entire canvas scales uniformly without distortion
      const widthRatio = width / referenceWidth;
      const heightRatio = height / referenceHeight;
      const scaleFactor = Math.min(widthRatio, heightRatio);
      
      // Clamp scale to prevent extreme values
      const clampedScale = Math.max(minScale, Math.min(maxScale, scaleFactor));
      setScale(clampedScale);
    }

    updateScale();

    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      // Debounce resize for performance
      timeoutId = setTimeout(updateScale, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', updateScale);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', updateScale);
      clearTimeout(timeoutId);
    };
  }, [referenceWidth, referenceHeight, minScale, maxScale]);

  return {
    scale,
    viewport,
    isLandscape: viewport.width > viewport.height,
  };
}

