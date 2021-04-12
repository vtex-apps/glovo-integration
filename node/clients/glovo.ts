import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

export default class Glovo extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('https://stageapi.glovoapp.com', context, {
      ...options,
      headers: {
        Authorization: '2602cc13-fe23-47b0-b3ac-71e14f4fd0f8',
        'Content-Type': 'application/json',
      },
    })
  }

  public api = (body: unknown) => this.http.post('/', body)

  public updateOrderStatus = (body: unknown) => {
    this.http.put('/', body)
  }

  public updateProducts = (body: any) => {
    // eslint-disable-next-line no-console
    console.log(body)
    const { glovoStoreId, skuId, price, available } = body

    const data = {
      price,
      available,
    }

    return this.http.patch(
      `/webhook/stores/${glovoStoreId}/products/${skuId}`,
      data
    )
  }
}
