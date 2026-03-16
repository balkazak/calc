import { clientApi } from '../../api/client.api'

export function usePersonDataAccess() {
  const ensureAccess = async (iin: string) => {
    const startTime = Date.now()
    // const timeout = 120000 // 2 minutes
    // const interval = 15000 // 15 seconds
    const timeout = 9000
    const interval = 3000
    while (true) {
      const accessResponse = await clientApi.calcInitPersonDataAccess(iin)

      const rawData = accessResponse.data as unknown as Record<string, unknown>
      const accessData =
        (rawData.data as { status: string }) || accessResponse.data

      if (accessData?.status === 'SUCCESS') {
        return
      }

      if (Date.now() - startTime > timeout) {
        throw new Error('Timeout waiting for person data access')
      }

      await new Promise((resolve) => setTimeout(resolve, interval))
    }
  }

  return {
    ensureAccess,
  }
}
