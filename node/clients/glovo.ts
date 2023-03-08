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

  public async bulkUpdateProducts(
    data: GlovoProductBulkUpdate,
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
  ): Promise<GlovoOrder> {
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
