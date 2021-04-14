import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

export default class Glovo extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('https://stageapi.glovoapp.com', context, options)
  }

  public api = (body: unknown) => this.http.post('/', body)

  public updateOrderStatus = (body: unknown) => {
    this.http.put('/', body)
  }

  public updateProducts = (body: GlovoUpdateProduct) => {
    const { glovoStoreId, skuId, glovoToken, price, available } = body

    const data: any = {
      available,
    }

    if (price) data.price = price

    return this.http.patch(
      `/webhook/stores/${glovoStoreId}/products/${skuId}`,
      data,
      {
        headers: {
          Authorization: glovoToken,
          'Content-Type': 'application/json',
        },
      }
    )
  }
}
