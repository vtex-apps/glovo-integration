interface SimulationItem {
  id: string
  quantity: number
  sellerId: string
}

interface SimulatedItem {
  price: number
  available: boolean
}

interface CreateSimulationArgs {
  items: PayloadItem[]
  postalCode?: string
  country?: string
  affiliateId: string
  salesChannel: string
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
  documentType: string | null
  document: string | null
  phone: string | null
  corporateName: string | null
  tradeName?: string | null
  corporateDocument?: string | null
  stateInscription?: string | null
  corporatePhone?: string | null
  isCorporate?: boolean
  userProfileId?: string | null
}

interface OrderRecord {
  orderId: string
  glovoOrder: GlovoOrder
  invoiced: any | null
  hasChanged: boolean
  createdAt?: number
  startHandlingAt?: string
  invoicedAt?: number
}

interface ComparisonObject {
  [key: string]: {
    id: string
    quantity: number
    purchased_product_id: string
  }
}

interface AppSettings {
  glovoToken: string
  production: boolean
  marketplace: boolean
  stores: StoreInfo[]
  clientProfileData: ClientProfileData
}

interface GlovoMenu {
  [key: string]: boolean
}

interface ProductRecord {
  id: string
  price?: number
  available?: boolean
}

interface StoreMenuUpdates {
  current: MenuUpdatesItem
  previous?: MenuUpdatesItem
}

interface MenuUpdatesItem {
  responseId: string | null
  createdAt: number
  storeId: string
  glovoStoreId: string
  items: ProductRecord[]
}
