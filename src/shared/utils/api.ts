import type { NomadApiResponse } from '../../features/mst-calculator/model/mst.types'

export function normalizeResponse<T>(response: NomadApiResponse<T>): T | null {
  if (!response || !response.data) return null

  const rawData = response.data as any
  if (rawData && typeof rawData === 'object' && 'data' in rawData) {
    return rawData.data as T
  }

  return rawData as T
}

export function getClientId(data: any): string {
  if (!data) return ''
  const idValue = data.client_id || data.id
  return idValue ? String(idValue) : ''
}
