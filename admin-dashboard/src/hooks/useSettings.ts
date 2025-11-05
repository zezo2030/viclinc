import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsApi } from '@/api/settings'
import type {
  SystemSettings,
  UpdateSettingsRequest,
  UpdateGeneralSettingsRequest,
} from '@/types'

/**
 * Hook for fetching all settings
 */
export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getSettings(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook for updating settings (partial updates)
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateSettingsRequest) => settingsApi.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })
}

/**
 * Hook for updating general settings (with logo upload support)
 */
export function useUpdateGeneralSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateGeneralSettingsRequest) => settingsApi.updateGeneralSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })
}

/**
 * Hook for removing logo
 */
export function useRemoveLogo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => settingsApi.removeLogo(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })
}

/**
 * Helper functions for localStorage draft management
 */
const STORAGE_PREFIX = 'settings_draft_'

/**
 * Save draft to localStorage
 */
export const saveDraft = (sectionName: string, data: any): void => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${sectionName}`, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving draft:', error)
  }
}

/**
 * Load draft from localStorage
 */
export const loadDraft = <T>(sectionName: string): T | null => {
  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${sectionName}`)
    if (stored) {
      return JSON.parse(stored) as T
    }
  } catch (error) {
    console.error('Error loading draft:', error)
  }
  return null
}

/**
 * Clear draft from localStorage
 */
export const clearDraft = (sectionName: string): void => {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${sectionName}`)
  } catch (error) {
    console.error('Error clearing draft:', error)
  }
}

/**
 * Clear all settings drafts
 */
export const clearAllDrafts = (): void => {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.error('Error clearing all drafts:', error)
  }
}

/**
 * Check if there are any unsaved changes (drafts exist)
 */
export const hasUnsavedChanges = (): boolean => {
  try {
    const keys = Object.keys(localStorage)
    return keys.some((key) => key.startsWith(STORAGE_PREFIX))
  } catch (error) {
    return false
  }
}

/**
 * Hook to manage draft state for a specific section
 */
export function useDraft<T>(sectionName: string) {
  return {
    load: () => loadDraft<T>(sectionName),
    save: (data: T) => saveDraft(sectionName, data),
    clear: () => clearDraft(sectionName),
  }
}

