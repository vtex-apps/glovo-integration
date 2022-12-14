import type { InstanceOptions, IOContext } from '@vtex/api'
import { VBase } from '@vtex/api'

import { GLOVO, MENU, STORE_MENU, ORDERS } from '../constants'

export default class RecordsManager extends VBase {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(context, {
      ...options,
    })
  }

  // Glovo Menu Records
  public saveGlovoMenu = (data: GlovoMenu) =>
    this.saveJSON<GlovoMenu>(GLOVO, MENU, data)

  public getGlovoMenu = () => this.getJSON<GlovoMenu>(GLOVO, MENU, true)

  // Store's Menu Updates Records
  public saveStoreMenuUpdates = (affiliateId: string, data: StoreMenuUpdates) =>
    this.saveJSON<StoreMenuUpdates>(affiliateId, MENU, data)

  public getStoreMenuUpdates = (affiliateId: string) =>
    this.getJSON<StoreMenuUpdates>(affiliateId, MENU, true)

  // Product's Records
  public saveProductRecord = (
    affiliateId: string,
    skuId: string,
    data: ProductRecord
  ) => this.saveJSON<ProductRecord>(affiliateId, skuId, data)

  public getProductRecord = (affiliateId: string, skuId: string) =>
    this.getJSON<ProductRecord>(affiliateId, skuId, true)

  // Store's catalog
  public saveStoreMenuRecord = (affiliateId: string, data: StoreMenuRecord) =>
    this.saveJSON<StoreMenuRecord>(affiliateId, STORE_MENU, data)

  public getStoreMenuRecord = (affiliateId: string) =>
    this.getJSON<StoreMenuRecord>(affiliateId, STORE_MENU, true)

  // Order's Records
  public saveOrderRecord = (orderId: string, data: OrderRecord) =>
    this.saveJSON<OrderRecord>(ORDERS, orderId, data)

  public getOrderRecord = (orderId: string) =>
    this.getJSON<OrderRecord>(ORDERS, orderId, true)
}
