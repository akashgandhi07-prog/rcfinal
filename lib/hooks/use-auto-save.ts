import { useState, useEffect, useCallback, useRef } from 'react'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface UseAutoSaveOptions<T> {
  data: T
  onSave: (data: T) => Promise<boolean>
  debounceMs?: number
  enabled?: boolean
  onSaveSuccess?: () => void
  onSaveError?: (error: Error) => void
}

export function useAutoSave<T>({
  data,
  onSave,
  debounceMs = 1000,
  enabled = true,
  onSaveSuccess,
  onSaveError,
}: UseAutoSaveOptions<T>) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const previousDataRef = useRef<T>(data)
  const isInitialMount = useRef(true)

  const save = useCallback(async () => {
    if (!enabled) return

    setSaveStatus('saving')
    setError(null)

    try {
      const success = await onSave(data)
      if (success) {
        setSaveStatus('saved')
        setLastSaved(new Date())
        previousDataRef.current = data
        onSaveSuccess?.()
        
        // Reset to idle after 2 seconds
        setTimeout(() => {
          setSaveStatus('idle')
        }, 2000)
      } else {
        throw new Error('Save operation returned false')
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      setSaveStatus('error')
      onSaveError?.(error)
      
      // Reset error status after 5 seconds
      setTimeout(() => {
        setSaveStatus('idle')
      }, 5000)
    }
  }, [data, onSave, enabled, onSaveSuccess, onSaveError])

  useEffect(() => {
    // Skip auto-save on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false
      previousDataRef.current = data
      return
    }

    // Only save if data has actually changed
    if (JSON.stringify(data) === JSON.stringify(previousDataRef.current)) {
      return
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      save()
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, debounceMs, save])

  // Manual save function
  const manualSave = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    await save()
  }, [save])

  return {
    saveStatus,
    lastSaved,
    error,
    manualSave,
  }
}

