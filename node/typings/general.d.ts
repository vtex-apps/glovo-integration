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

interface CreateOrderPayload {
  marketplaceOrderId: string
  marketplaceServicesEndpoint: string
  marketplacePaymentValue: number
  marketplaceOrderGroup: string
  isCreatedAsync: boolean
  items: OrderItem[]
  clientProfileData: ClientProfileData
  shippingData: ShippingData
  paymentData?: PaymentData
  marketingData?: MarketingData
  openTextField?: any
  savePersonalData: boolean
}

interface OrderItem {
  id: string
  requestIndex: number
  quantity: number
  seller: string
  sellerChain: string[]
  tax: number
  priceValidUntil: string
  price: number
  listPrice: number
  sellingPrice: number
  rewardValue: number
  offerings?: any[]
  priceTags: any[]
  measurementunit: string
  unitMultiplier: number
  parentItemIndex: any
  parentAssemblyBinding: any
  availability: string
  catalogProvider: string
}

interface ShippingData {
  address: ShippingAddress
  logisticsInfo: ItemLogistics[]
}

interface ShippingAddress {
  addressType: string
  receiverName: string
  addressId: string
  postalCode: string
  city: string | null
  state: string | null
  country: string
  street: string
  number: string | null
  neighborhood: string | null
  complement: string | null
  reference: string | null
  geoCoordinates: number[] | []
}

interface ItemLogistics {
  itemIndex: number
  selectedSla: string
  addressId?: string
  selectedDeliveryChannel: string
  name?: string
  deliveryIds?: ItemLogisticsDeliveryId[]
  lockTTL: string
  deliveryWindow: {
    startDateUtc: string
    endDateUtc: string
    price: number
    lisPrice: number
    tax: number
  }
  shippingEstimate: string
  price: number
}

interface ItemLogisticsDeliveryId {
  warehouseId: string
  dockId: string
  accountCarrierName: string
}
interface PaymentData {
  id?: 'paymentData'
  payments: [
    {
      paymentSystem: string
      paymentSystemName?: string
      value: number
      installments: number
      referenceValue: number
    }
  ]
}

interface SimulationTotalsItem {
  id: string
  name: string
  value: number
}

interface MarketingData {
  utmSource: string
  utmMedium: string
  utmCampaign: string
  utmiPage: string
  utmiPart: string
  utmiCampaign: string
}

interface VTEXOrder {
  marketplaceOrderId: string
  orderId: string
  followUpEmail: string
  items: VTEXOrderItem[]
  clientProfileData: ClientProfileData
  shippingData: {
    isFOB: boolean
    address: ShippingAddress
    selectedAddresses: ShippingAddress[]
    logisticsInfo: ItemLogistics
    trackingHints: any[]
  }
  paymentData: any
  customData: any
  orders?: any
}

interface VTEXOrderItem {
  id: string
  quantity: number
  seller: string
  priceTable: any
  commission: number
  freightCommission: number
  price: number
  bundleItems: any[]
  priceTags: any[]
  measurementUnit: string
  unitMultiplier: number
  isGift: boolean
  manufacturerCode: string
  catalogProvider: string
}

interface CreateMarketplaceOrderResponse {
  orderForm?: any
  transactionData: any
  orders: VTEXMarketplaceOrder[]
}

interface VTEXMarketplaceOrder {
  orderId: string
  orderGroup: string
  state: string | null
  isCheckedIn: boolean
  sellerOrderId: string
  storeId: string | null
}
interface AuthorizeOrderPayload {
  marketplaceOrderId: string
}

interface AuthorizeMarketplaceOrderPayload {
  marketplaceOrderGroup: string
  authorizationReceipt: {
    date: string
    receipt: string
  }
}

interface VTEXAuthorizedOrder extends VTEXAuthorizedMarketplaceOrder {
  orderId: string
  marketplaceOrderId: string
}

interface VTEXAuthorizedMarketplaceOrder {
  receipt: string
  date: string
  items: [{ id: string }]
  shippingData: {
    logisticsInfo: [
      {
        itemIndex: number
        selectedSLAId: string
        selectedDeliveryChannel: string
        shippingEstimateDate: string
      }
    ]
  }
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

interface OrderRecord {
  orderId: string
  glovoOrder: GlovoOrder
  invoiced: any | null
  hasChanged: boolean
  createdAt?: number
  startHandlingAt?: string
  invoicedAt?: number
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

interface OrderChangeBody {
  requestId: string
  reason: string
  discountValue: number
  incrementValue: number
  itemsRemoved: OrderChangeItem[]
  itemsAdded: OrderChangeItem[]
}

interface OrderChangeItem {
  id: string
  price: number
  quantity: number
}
