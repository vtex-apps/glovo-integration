interface CatalogChange {
  IdSku: string
  ProductId: string
  An: string
  IdAffiliate: string
  Version: string
  DateModified: Date
  IsActive: boolean
  StockModified: boolean
  PriceModified: boolean
  HasStockKeepingUnitModified: boolean
  HasStockKeepingUnitRemovedFromAffiliate: boolean
}

interface SimulationTotalsItem {
  id: string
  name: string
  value: number
}

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

interface ProductRecord {
  id: string
  price?: number
  available?: boolean
}

interface StoreMenuRecord {
  items: {
    [id: string]: ProductRecord
  }
  lastUpdated: string
}

interface GlovoMenu {
  [key: string]: boolean
}

interface StoreMenuUpdates {
  current: MenuUpdatesItem
  previous?: MenuUpdatesItem
}

interface MenuUpdatesItem {
  responseId: string | null
  createdAt: number
  storeId: string
  storeName: string
  glovoStoreId: string
  items: ProductRecord[]
}
