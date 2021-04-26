import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

import { setGlovoStatus } from '../utils'

const BASE_URL = {
  PRODUCTION: 'https://api.glovoapp.com',
  STAGING: 'https://stageapi.glovoapp.com',
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

  private static async getAppSettings(ctx: Context | StatusChangeContext) {
    return ctx.clients.apps.getAppSettings('vtex.glovo-integration')
  }

  public api = (body: unknown) => this.http.post('/', body)

  public updateProducts = async (ctx: Context, data: GlovoUpdateProduct) => {
    const { glovoStoreId, skuId, price, available } = data
    const enviroment = this.context.production ? 'PRODUCTION' : 'STAGING'
    const { glovoToken } = await Glovo.getAppSettings(ctx)

    const payload: GlovoPatchProduct = {
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

  public updateOrderStatus = async (
    ctx: StatusChangeContext,
    data: GlovoUpdateOrderStatus
  ) => {
    const { glovoStoreId, glovoOrderId, currentState } = data
    const enviroment = this.context.production ? 'PRODUCTION' : 'STAGING'
    const { glovoToken } = await Glovo.getAppSettings(ctx)
    const status = setGlovoStatus(currentState)

    const payload: { status: string } = {
      status,
    }

    return this.http.put(
      `${BASE_URL[enviroment]}/webhook/stores/${glovoStoreId}/orders/${glovoOrderId}/status`,
      payload,
      {
        headers: {
          Authorization: glovoToken,
        },
      }
    )
  }
}
