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

interface CreateSimulationArgs {
  items: PayloadItem[]
  postalCode?: string
  country?: string
  affiliateId: string
  salesChannel: string
}

interface AffiliateInfo {
  affiliateId: string
  salesChannel: string
  postalCode: string
  glovoStoreId: string
}

interface GlovoOrder {
  order_id: string
  store_id: string
  order_time: string
  estimated_pickup_time: string
  utc_offset_minutes: string
  payment_method: string
  currency: string
  courier: Courier
  customer: GlovoCustomer
  /**
   * Alphanumeric identifier of the order used for historical identification or with Glovo support
   *
   * @type {string}
   * @memberOf GlovoOrder
   */
  order_code: string
  allergy_info: string
  /**
   * Estimated total price of the order products and attributes in cents. Delivery fee is not included
   *
   * @type {number}
   * @memberOf GlovoOrder
   */
  estimated_total_price: number
  /**
   * Marketplace partners: delivery price of the order in cents.
   * Normal partners: null
   *
   * @type {(number | null)}
   * @memberOf GlovoOrder
   */
  delivery_fee: number | null
  /**
   * Marketplace partners: minimum basket surcharge in cents.
   * Normal partners: null
   *
   * @type {(number | null)}
   * @memberOf GlovoOrder
   */
  minimum_basket_surcharge: number | null
  /**
   * Marketplace partners: cash amount that the customer will pay with. In cents or null if not informed.
   * Normal partners: null
   *
   * @type {(number | null)}
   * @memberOf GlovoOrder
   */
  customer_cash_payment_amount: number | null
  products: GlovoProduct[]
  /**
   * Marketplace partners: object containing information about the delivery address (Delivery address object)
   * Normal partners: null
   *
   * @type {(GlovoDeliveryAddress | null)}
   * @memberOf GlovoOrder
   */
  delivery_address: GlovoDeliveryAddress | null
  /**
   * Marketplace partners: empty array
   * Normal partners: array containing the list of the orders bundled with current order
   *
   * @type {string[]}
   * @memberOf GlovoOrder
   */
  bundled_orders: string[]
  /**
   * Non-sequential, non-unique 3 digit numerical code used to identify an order for pickup by the courier or customer.
   *
   * @type {string}
   * @memberOf GlovoOrder
   */
  pick_up_code: string
  /**
   * Boolean to indicate if the order will be picked up by a customer instead of by a courier
   *
   * @type {boolean}
   * @memberOf GlovoOrder
   */
  is_picked_up_by_customer: boolean
  cutlery_requested: boolean
  partner_discounts_products: number
  partner_discounted_products_total: number
  /**
   * Marketplace: Final amount to be paid in cents by customer including discounts, promotions, surcharges, fees and other adjustments
   * Normal partners: null
   *
   * @type {(number | null)}
   * @memberOf GlovoOrder
   */
  total_customer_to_pay: number | null
}

interface Courier {
  name: sring
  phone_number: string
}

interface GlovoCustomer {
  name: string
  phone_number: string
  hash: string
  /**
   * Object containing invoicing information. Null if the customer doesn't need invoice (Invoicing details object)
   *
   * @type {(GlovoCustomerInvoice | null)}
   * @memberOf GlovoCustomer
   */
  invoicing_details: GlovoCustomerInvoice | null
}

interface GlovoCustomerInvoice {
  company_name: string
  company_address: string
  tax_id: string
}

interface GlovoProduct {
  id: string
  quantity: number
  name?: string
  price?: number
  attributes: GlovoProductAttributes[]
  purchased_product_id?: string
}

interface GlovoProductAttributes {
  id: string
  quantity: number
  name?: string
  price?: number
  purchased_product_id?: string
}

interface GlovoDeliveryAddress {
  label: string
  longitude: number
  latitude: number
}

interface GlovoOrderCancellation {
  order_id: string
  store_id: string
  cancel_reason: string
  payment_strategy: string
}

interface GlovoUpdateProduct {
  price?: number
  available: boolean
  skuId: string
  glovoStoreId: string
}

interface GlovoPatchProduct {
  available: boolean
  price?: number
}

interface GlovoUpdatedProduct {
  purchased_product_id: string
  product: GlovoProduct
}

interface GlovoUpdateOrderStatus {
  glovoStoreId: string
  glovoOrderId: string
  status: string
}
interface MarketplaceOrder {
  marketplaceOrderId: string
  marketplaceServicesEndpoint: string
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

interface OrderRecord {
  orderId: string
  glovoOrder: GlovoOrder
  invoiced: any | null
  hasChanged: boolean
  createdAt?: string
  startHandlingAt?: string
  invoicedAt?: string
}

interface GlovoModifyOrderPayload {
  storeId: string
  glovoOrderId: string
  replacements: Array<{
    purchased_product_id: string
    product: GlovoModifiedProduct
  }>
  removed_purchases: Array<string | undefined>
  added_products: GlovoModifiedProduct[]
}

interface GlovoModifiedProduct {
  id: string
  quantity: number
  attributes: GlovoModifiedProductAttributes[]
}

interface GlovoModifiedProductAttributes {
  id: string
  quantity: number
}

interface ComparisonObject {
  [key: string]: {
    id: string
    quantity: number
    purchased_product_id: string
  }
}

interface AppConfig {
  glovoToken: strings
  affiliateConfig: AffiliateInfo[]
  clientProfileData: ClientProfileData
}
