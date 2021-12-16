import type { InstanceOptions, IOContext } from '@vtex/api'
import { VBase } from '@vtex/api'

import { GLOVO, MENU, ORDERS } from '../constants'

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
  public saveStoreMenuUpdates = (storeId: string, data: StoreMenuUpdates) =>
    this.saveJSON<StoreMenuUpdates>(storeId, MENU, data)

  public getStoreMenuUpdates = (storeId: string) =>
    this.getJSON<StoreMenuUpdates>(storeId, MENU, true)

  // Product's Records
  public saveProductRecord = (
    storeId: string,
    skuId: string,
    data: ProductRecord
  ) => this.saveJSON<ProductRecord>(storeId, skuId, data)

  public getProductRecord = (storeId: string, skuId: string) =>
    this.getJSON<ProductRecord>(storeId, skuId, true)

  // Order's Records
  public saveOrderRecord = (orderId: string, data: OrderRecord) =>
    this.saveJSON<OrderRecord>(ORDERS, orderId, data)

  public getOrderRecord = (orderId: string) =>
    this.getJSON<OrderRecord>(ORDERS, orderId, true)
}
