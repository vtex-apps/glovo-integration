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

interface AffiliateInfo {
  affiliateId: string
  salesChannel: string
  glovoStoreId: string
}
