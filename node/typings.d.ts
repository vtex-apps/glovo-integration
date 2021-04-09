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
  name: string
  price: number
  attributes: GlovoProductAttributes[]
  purchased_product_id: string
}

interface GlovoProductAttributes {
  id: string
  quantity: number
  name: string
  price: number
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
