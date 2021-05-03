/* eslint-disable @typescript-eslint/naming-convention */
import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

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

  public updateProducts = async (ctx: Context, data: GlovoUpdateProduct) => {
    const enviroment = this.context.production ? 'PRODUCTION' : 'STAGING'
    const { glovoStoreId, skuId, price, available } = data
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
    const enviroment = this.context.production ? 'PRODUCTION' : 'STAGING'
    const { glovoStoreId, glovoOrderId, status } = data
    const { glovoToken } = await Glovo.getAppSettings(ctx)

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

  public modifyOrder = async (ctx: any, data: GlovoModifyOrderPayload) => {
    const enviroment = this.context.production ? 'PRODUCTION' : 'STAGING'
    const { glovoToken } = await Glovo.getAppSettings(ctx)
    const {
      storeId,
      glovoOrderId,
      replacements,
      removed_purchases,
      added_products,
    } = data

    const payload = {
      replacements,
      removed_purchases,
      added_products,
    }

    return this.http.post(
      `${BASE_URL[enviroment]}/webhook/stores/${storeId}/orders/${glovoOrderId}/replace_products`,
      payload,
      {
        headers: {
          Authorization: glovoToken,
        },
      }
    )
  }

  private static async getAppSettings(ctx: Context | StatusChangeContext) {
    return ctx.clients.apps.getAppSettings('vtex.glovo-integration')
  }
}
