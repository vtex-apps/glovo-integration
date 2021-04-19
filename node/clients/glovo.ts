import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

const BASE_URL = {
  PRODUCTION: 'https://api.glovoapp.com',
  STAGING: 'https://stagepi.glovoapp.com',
}

export default class Glovo extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('glovoapp.com', context, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
  }

  private static async getAppSettings(ctx: Context) {
    return ctx.clients.apps.getAppSettings('vtex.glovo-integration')
  }

  public api = (body: unknown) => this.http.post('/', body)

  public updateOrderStatus = (body: unknown) => {
    this.http.put('/', body)
  }

  public updateProducts = async (ctx: Context, body: GlovoUpdateProduct) => {
    const { glovoStoreId, skuId, price, available } = body
    const enviroment = this.context.production ? 'PRODUCTION' : 'STAGING'
    const { glovoToken } = await Glovo.getAppSettings(ctx)

    const payload: any = {
      available,
    }

    if (price) payload.price = price

    return this.http.patch(
      `${BASE_URL[enviroment]}/webhook/stores/${glovoStoreId}/products/${skuId}`,
      payload,
      {
        headers: {
          Authorization: glovoToken,
        },
      }
    )
  }
}
