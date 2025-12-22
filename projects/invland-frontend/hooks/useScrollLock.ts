import { useRef, useCallback } from 'react'

export function useScrollLock(lockDuration: number = 1000) {
  const isLockedRef = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const lock = useCallback(() => {
    isLockedRef.current = true
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      isLockedRef.current = false
    }, lockDuration)
  }, [lockDuration])

  const unlock = useCallback(() => {
    isLockedRef.current = false
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  const isLocked = useCallback(() => isLockedRef.current, [])

  return { lock, unlock, isLocked }
}
