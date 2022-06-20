declare module 'uuid'
declare module 'react-apollo'
declare module 'vtex.styleguide'
declare module 'vtex.native-types'

interface AppSettings {
  glovoToken: string
  production: boolean
  stores: StoreInfo[]
  clientProfileData: ClientProfileData
}
interface StoreInfo {
  id: string
  storeName: string
  sellerId: string
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

interface Seller {
  id: string
  name: string
  isActive: boolean
}

interface TableItem {
  cellData: unknown
  rowData: StoreInfo
  updateCellMeasurements: () => void
}

type AlertType = 'success' | 'warning' | 'error'

interface SelectOption {
  label: string
  value: string
}

interface UpdateStore {
  storeId: string
  store: StoreInfo | null
  isOpen: boolean
  loading: boolean
}

type ModifyStore = Pick<UpdateStore, 'isOpen' | 'loading'>
type RemoveStore = Omit<UpdateStore, 'store'>
type AddOrEditStore = Omit<UpdateStore, 'storeId'>
