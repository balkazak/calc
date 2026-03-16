import { useMstStore } from '../mst.store'
import { clientApi } from '../../../api/client.api'
import { usePersonDataAccess } from '../../composables/useClientAccess'
import type { MstClientData } from '../../mst.types'
import { normalizeResponse, getClientId } from '../../../../../shared/utils/api'

const useStore = () => useMstStore()

export const useMstTouristActions = () => {
  const store = useStore()
  const { ensureAccess } = usePersonDataAccess()

  const _parseFullName = (fullName: string) => {
    const parts = (fullName || '').trim().split(/\s+/)
    return parts.length >= 2
      ? { lastName: parts[0], firstName: parts.slice(1).join(' ') }
      : { firstName: fullName || '', lastName: '' }
  }

  const _setTouristData = (
    index: number,
    fullName: string,
    iin: string,
    clientId?: string,
    clearNames = false
  ) => {
    const tourist = store.params.touristsInfo[index]
    if (!tourist) return

    if (clearNames) {
      tourist.firstName = ''
      tourist.lastName = ''
    } else if (fullName) {
      const { firstName, lastName } = _parseFullName(fullName)
      if (firstName) tourist.firstName = firstName
      if (lastName) tourist.lastName = lastName
    }

    tourist.iin = iin
    if (clientId) tourist.clientId = clientId

    if (store.params.isTourist && index === 0) {
      if (!store.policyHolderInfo) {
        store.policyHolderInfo = { firstName: '', lastName: '' }
      }

      const hasNoName =
        !store.policyHolderInfo.firstName && !store.policyHolderInfo.lastName

      if (hasNoName || clearNames) {
        if (tourist.firstName)
          store.policyHolderInfo.firstName = tourist.firstName
        if (tourist.lastName) store.policyHolderInfo.lastName = tourist.lastName
      }

      store.params.policyholderIin = iin
      if (clientId) store.policyHolderClientId = clientId
    }
  }

  const searchAndSetTourist = async (index: number, iin: string) => {
    try {
      const response = await clientApi.searchClient(iin)
      const responseData = normalizeResponse<MstClientData>(response)
      if (!responseData) return response

      const clientId = getClientId(responseData)

      if (responseData.gbd_have) {
        const tourist = store.params.touristsInfo[index]
        if (tourist) tourist.iin = iin

        try {
          const syncRes = await clientApi.syncClient(iin)
          const syncData = normalizeResponse<MstClientData>(syncRes)

          if (syncData && String(syncData.document_found) === 'false') {
            return { data: syncData }
          }

          if (syncData?.full_name) {
            _setTouristData(
              index,
              syncData.full_name,
              iin,
              getClientId(syncData) || clientId
            )
          }
        } catch (e: any) {
          console.error(`Background sync failed for tourist ${index}:`, e)
          if (
            (e?.response?.data?.error || e?.message || '').includes(
              'Client not found'
            )
          ) {
            throw { message: 'Sync failed: Client not found', gbd_have: true }
          }
          throw e
        }
      }

      return { data: responseData }
    } catch (error) {
      console.error('Failed to search and set tourist:', error)
      throw error
    }
  }

  const saveManualTourist = async (
    index: number,
    payload: Record<string, unknown>
  ) => {
    try {
      const response = await clientApi.saveClient(payload)
      const responseData = normalizeResponse<MstClientData>(response)

      if (responseData) {
        _setTouristData(
          index,
          responseData.full_name || '',
          (payload.iin as string) || '',
          getClientId(responseData)
        )
      }
      return response
    } catch (error) {
      console.error('Failed to save manual tourist:', error)
      throw error
    }
  }

  const saveManualPolicyholder = async (payload: Record<string, unknown>) => {
    try {
      const response = await clientApi.saveClient(payload)
      const responseData = normalizeResponse<MstClientData>(response)

      if (responseData) {
        const fullName = responseData.full_name || ''
        const { firstName, lastName } = _parseFullName(fullName)

        store.hasGbdData = true
        store.policyHolderInfo = {
          firstName: firstName || '',
          lastName: lastName || '',
          age: (responseData as any).age,
        }
        store.policyHolderClientId = getClientId(responseData)

        if (store.params.isTourist && store.params.touristsInfo.length > 0) {
          _setTouristData(
            0,
            fullName,
            (payload.iin as string) || '',
            store.policyHolderClientId
          )
        }
      }
      return response
    } catch (error) {
      console.error('Failed to save manual policyholder:', error)
      throw error
    }
  }

  const syncTourist = async (index: number, iin: string) => {
    try {
      await ensureAccess(iin)
      const response = await clientApi.syncClient(iin)
      const data = normalizeResponse<MstClientData>(response)

      if (data && String(data.document_found) !== 'false') {
        _setTouristData(index, data.full_name || '', iin, getClientId(data))
      }
      return response
    } catch (error) {
      console.error('Failed to sync tourist:', error)
      throw error
    }
  }

  const searchAndSetPolicyholder = async (iin: string) => {
    try {
      const response = await clientApi.searchClient(iin)
      const data = normalizeResponse<MstClientData>(response)
      if (!data) return response

      store.hasGbdData = !!data.gbd_have
      const clientId = getClientId(data)
      if (clientId) store.policyHolderClientId = clientId

      return response
    } catch (error) {
      console.error('Failed to search and set policyholder:', error)
      store.hasGbdData = false
      throw error
    }
  }

  const syncPolicyholder = async (iin: string, poll = true) => {
    try {
      if (poll) await ensureAccess(iin)
      const response = await clientApi.syncClient(iin)
      const data = normalizeResponse<MstClientData>(response)

      if (data) {
        const clientId = getClientId(data)
        const { fullName, documentFound } = {
          fullName: data.full_name,
          documentFound: data.document_found,
        }

        if (documentFound) {
          store.hasGbdData = true
          if (fullName) {
            const { firstName, lastName } = _parseFullName(fullName)
            store.policyHolderInfo = {
              firstName: firstName || '',
              lastName: lastName || '',
              age: (data as any).age,
            }
          }

          if (store.params.isTourist) {
            _setTouristData(0, fullName || '', iin, clientId)
          }
        } else if (store.params.isPolicyHolder && !store.params.isTourist) {
          store.hasGbdData = false
          if (fullName) {
            const { firstName, lastName } = _parseFullName(fullName)
            store.policyHolderInfo = {
              firstName: firstName || '',
              lastName: lastName || '',
              age: (data as any).age,
            }
          }
        }
      }
      return response
    } catch (error: any) {
      console.error('Failed to sync policyholder:', error)
      if (
        (error?.response?.data?.error || error?.message || '').includes(
          'Client not found'
        )
      ) {
        throw { message: 'Sync failed: Client not found', gbd_have: true }
      }
      throw error
    }
  }

  return {
    searchAndSetTourist,
    saveManualTourist,
    syncTourist,
    searchAndSetPolicyholder,
    syncPolicyholder,
    saveManualPolicyholder,
  }
}
