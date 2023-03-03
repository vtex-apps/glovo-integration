interface VTEXOrder {
  marketplaceOrderId: string
  orderId: string
  followUpEmail: string
  items: VTEXOrderItem[]
  clientProfileData: ClientProfileData
  shippingData: {
    address: ShippingAddress
    logisticsInfo: ItemLogistics
    isFOB: boolean
    selectedAddresses: ShippingAddress[]
    trackingHints: any[]
  }
  paymentData: any
  customData: any
  orders?: any
  changesAttachment: ChangesAttachment
}

interface CreateOrderPayload {
  marketplaceOrderId: string
  marketplaceServicesEndpoint: string
  marketplacePaymentValue: number
  marketplaceOrderGroup: string
  isCreatedAsync: boolean
  items: VTEXOrderItem[]
  clientProfileData: ClientProfileData
  shippingData: ShippingData
  paymentData?: PaymentData
  marketingData?: MarketingData
  openTextField?: string
  savePersonalData: boolean
}

interface CreateMarketplaceOrderResponse {
  orderForm?: any
  transactionData: any
  orders: VTEXMarketplaceOrder[]
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

interface OrderRecord {
  orderId: string
  glovoOrder: GlovoOrder
  invoiced: any | null
  hasChanged: boolean
  createdAt?: number
  startHandlingAt?: string
  invoicedAt?: number
}

interface OrderChangeBody {
  requestId: string
  reason: string
  discountValue: number
  incrementValue: number
  itemsRemoved: OrderChangeItem[]
  itemsAdded: OrderChangeItem[]
}

interface VTEXMarketplaceOrder {
  orderId: string
  orderGroup: string
  state: string | null
  isCheckedIn: boolean
  sellerOrderId: string
  storeId: string | null
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

interface OrderChangeItem {
  id: string
  price: number
  quantity: number
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

interface ChangesAttachment {
  id: string
  changesData: ChangesData[]
}

interface ChangesData {
  reason: string
  discountvalue: number
  incrementValue: number
  itemsAdded: ChangesAttachmentItem[]
  itemsRemoved: ChangesAttachmentItem[]
  receipt: {
    date: string
    orderId: string
    receipt: string
  }
}

interface ChangesAttachmentItem {
  id: string
  name: string
  quantity: number
  price: number
  unitMultiplier: number
}

interface ShippingData {
  address: ShippingAddress
  logisticsInfo: ItemLogistics[]
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

interface MarketingData {
  utmSource: string
  utmMedium: string
  utmCampaign: string
  utmiPage: string
  utmiPart: string
  utmiCampaign: string
}
