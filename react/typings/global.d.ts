declare module 'uuid'
declare module 'react-apollo'
declare module 'vtex.styleguide'
declare module 'vtex.native-types'

interface AppSettings {
  glovoToken: string
  production: boolean
  marketplace: boolean
  stores: StoreInfo[]
  clientProfileData: ClientProfileData
}
interface StoreInfo {
  id: string
  storeName: string
  sellerId: string
  sellerName: string
  affiliateId: string
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

type AlertType = 'success' | 'warning' | 'error'
