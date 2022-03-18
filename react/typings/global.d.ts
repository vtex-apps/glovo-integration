declare module 'uuid'
declare module 'react-apollo'
declare module 'vtex.styleguide'
declare module 'vtex.native-types'

interface AppConfig {
  glovoToken: string
  production: boolean
  storesConfig: StoreInfo[]
  clientProfileData: ClientProfileData
}
interface StoreInfo {
  storeName: string
  storeId: string
  salesChannel: string
  postalCode: string
  country: string
  glovoStoreId: string
}

interface ClientProfileData {
  email: string
  firstName: string
  lastName: string
  documentType: string
  document: string
  phone: string
  corporateName: string
}

interface TableItem {
  cellData: unknown
  rowData: StoreInfo
  updateCellMeasurements: () => void
}
