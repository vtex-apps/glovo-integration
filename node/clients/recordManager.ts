import type { InstanceOptions, IOContext } from '@vtex/api'
import { VBase } from '@vtex/api'

import {
  GLOVO,
  MENU,
  STORE_MENU,
  ORDERS,
  STORE_MENU_UPDATE,
} from '../constants'

export default class RecordsManager extends VBase {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(context, {
      ...options,
    })
  }

  // Glovo Menu Records
  public saveGlovoMenu(data: GlovoMenu) {
    return this.saveJSON<GlovoMenu>(GLOVO, MENU, data)
  }

  public getGlovoMenu() {
    return this.getJSON<GlovoMenu>(GLOVO, MENU, true)
  }

  // Store's Menu Updates Records
  public saveStoreMenuUpdates(affiliateId: string, data: StoreMenuUpdates) {
    return this.saveJSON<StoreMenuUpdates>(affiliateId, MENU, data)
  }

  public getStoreMenuUpdates(affiliateId: string) {
    return this.getJSON<StoreMenuUpdates>(affiliateId, MENU, true)
  }

  // Product's Records
  public saveProductRecord(
    affiliateId: string,
    skuId: string,
    data: ProductRecord
  ) {
    return this.saveJSON<ProductRecord>(affiliateId, skuId, data)
  }

  public getProductRecord(affiliateId: string, skuId: string) {
    return this.getJSON<ProductRecord>(affiliateId, skuId, true)
  }

  // Store's catalog
  public saveStoreMenuRecord(affiliateId: string, data: StoreMenuRecord) {
    return this.saveJSON<StoreMenuRecord>(affiliateId, STORE_MENU, data)
  }

  public getStoreMenuRecord(affiliateId: string) {
    return this.getJSON<StoreMenuRecord>(affiliateId, STORE_MENU, true)
  }

  // Store's catalog update
  public saveStoreCompleteMenuUpdate(
    affiliateId: string,
    data: CompleteUpdateRecord
  ) {
    return this.saveJSON(affiliateId, STORE_MENU_UPDATE, data)
  }

  public getStoreCompleteMenuUpdate(affiliateId: string) {
    return this.getJSON<{ items: GlovoProductPatch[]; lastUpdated: string }>(
      affiliateId,
      STORE_MENU_UPDATE,
      true
    )
  }

  // Order's Records
  public saveOrderRecord(orderId: string, data: OrderRecord) {
    return this.saveJSON<OrderRecord>(ORDERS, orderId, data)
  }

  public getOrderRecord(orderId: string) {
    return this.getJSON<OrderRecord>(ORDERS, orderId, true)
  }
}
