import type { InstanceOptions, IOContext } from '@vtex/api'
import { PRODUCTION, ExternalClient } from '@vtex/api'

export default class Glovo extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('glovoapp.com', context, {
      ...options,
      headers: {
        contentType: 'application/json',
        Accept: 'application/json',
      },
    })
  }

  private baseUrl() {
    return PRODUCTION
      ? 'https://api.glovoapp.com'
      : 'https://stageapi.glovoapp.com'
  }

  public async updateProducts(
    { glovoStoreId, skuId, price, available }: GlovoUpdateProduct,
    glovoToken: string
  ) {
    const payload: GlovoPatchProduct = {
      available,
    }

    if (price) payload.price = price

    return this.http.patch(
      `${this.baseUrl()}/webhook/stores/${glovoStoreId}/products/${skuId}`,
      payload,
      {
        headers: {
          Authorization: glovoToken,
        },
      }
    )
  }

  public async bulkUpdateProducts(
    data: GlovoBulkUpdateProduct,
    glovoStoreId: string,
    glovoToken: string
  ) {
    return this.http.post<GlovoBulkUpdateResponse>(
      `${this.baseUrl()}/webhook/stores/${glovoStoreId}/menu/updates`,
      data,
      {
        headers: {
          Authorization: glovoToken,
        },
      }
    )
  }

  public async updateOrderStatus(
    { glovoStoreId, glovoOrderId, status }: GlovoUpdateOrderStatus,
    glovoToken: string
  ) {
    return this.http.put(
      `${this.baseUrl()}/webhook/stores/${glovoStoreId}/orders/${glovoOrderId}/status`,
      {
        status,
      },
      {
        headers: {
          Authorization: glovoToken,
        },
      }
    )
  }

  public async modifyOrder(
    {
      glovoStoreId,
      glovoOrderId,
      replacements,
      removed_purchases,
      added_products,
    }: GlovoModifyOrderPayload,
    glovoToken: string
  ) {
    return this.http.post(
      `${this.baseUrl()}/webhook/stores/${glovoStoreId}/orders/${glovoOrderId}/replace_products`,
      {
        replacements,
        removed_purchases,
        added_products,
      },
      {
        headers: {
          Authorization: glovoToken,
        },
      }
    )
  }
}
