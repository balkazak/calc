import { calculatorClientApi } from '@shared/api/sdk'
import type {
  MstClientData,
  NomadApiResponse,
  InitPersonAccessResponse,
  ClientApiExtended,
} from '../model/mst.types'

type SaveClientRequest = Parameters<
  typeof calculatorClientApi.saveNaturalClient
>[0]
type SyncClientRequest = Parameters<
  typeof calculatorClientApi.searchAndSyncNaturalClient
>[0]

export const clientApi = {
  searchClient: (iin: string): Promise<NomadApiResponse<MstClientData>> =>
    calculatorClientApi.searchNaturalClient({
      iin,
    }) as unknown as Promise<NomadApiResponse<MstClientData>>,

  syncClient: (
    iin: string,
    documentType: string = 'rk_passport'
  ): Promise<NomadApiResponse<MstClientData>> =>
    calculatorClientApi.searchAndSyncNaturalClient({
      iin,
      document_type:
        documentType as unknown as SyncClientRequest['document_type'],
    }) as unknown as Promise<NomadApiResponse<MstClientData>>,

  saveClient: (
    data: Record<string, unknown>
  ): Promise<NomadApiResponse<MstClientData>> =>
    calculatorClientApi.saveNaturalClient({
      ...data,
      id: 0,
    } as unknown as SaveClientRequest) as unknown as Promise<
      NomadApiResponse<MstClientData>
    >,

  calcInitPersonDataAccess: (
    iin: string
  ): Promise<NomadApiResponse<InitPersonAccessResponse>> =>
    (
      calculatorClientApi as unknown as ClientApiExtended
    ).calcinitPersonDataAccess({
      iin,
    }),
}
