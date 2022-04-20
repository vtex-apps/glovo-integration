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

interface MarketplaceOrder {
  marketplaceOrderId: string
  marketplaceServicesEndpoint: string
  isCreatedAsync: boolean
  marketplacePaymentValue: number
  items: OrderItem[]
  clientProfileData: ClientProfileData
  shippingData: ShippingData
  paymentData?: PaymentData
  marketingData?: MarketingData
  openTextField?: any
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
  id: 'paymentData'
  payments: [
    {
      paymentSystem: string
      paymentSystemName: string
      value: number
      installments: number
      referenceValue: number
    }
  ]
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

interface AuthorizeOrderPayload {
  marketplaceOrderId: string
}

interface VTEXAuthorizedOrder {
  orderId: string
  marketplaceOrderId: string
  receipt: string
  date: string
  items: [{ id: string }]
  shippingData: {
    logisticsInfo: [
      {
        itemIndex: number
        selectedSla: string
        selectedDeliveryChannel: string
        shippingEstimateDate: string
      }
    ]
  }
}
