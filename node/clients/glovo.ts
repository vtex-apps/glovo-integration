/* eslint-disable @typescript-eslint/naming-convention */
import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

const BASE_URL = {
  PRODUCTION: 'https://api.glovoapp.com',
  STAGING: 'https://stageapi.glovoapp.com',
}

const PRODUCTION = 'PRODUCTION'
const STAGING = 'STAGING'

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

  public updateProducts = async (ctx: Context, data: GlovoUpdateProduct) => {
    const { glovoStoreId, skuId, price, available } = data
    const { glovoToken, production }: AppSettings = await Glovo.getAppSettings(
      ctx
    )

    const environment = production ? PRODUCTION : STAGING

    const payload: GlovoPatchProduct = {
      available,
    }

    if (price) payload.price = price

    return this.http.patch(
      `${BASE_URL[environment]}/webhook/stores/${glovoStoreId}/products/${skuId}`,
      payload,
      {
        headers: {
          Authorization: glovoToken,
        },
      }
    )
  }

  public bulkUpdateProducts = async (
    ctx: Context,
    data: GlovoBulkUpdateProduct,
    glovoStoreId: string
  ) => {
    const { glovoToken, production }: AppSettings = await Glovo.getAppSettings(
      ctx
    )

    const environment = production ? PRODUCTION : STAGING

    return this.http.post<GlovoBulkUpdateResponse>(
      `${BASE_URL[environment]}/webhook/stores/${glovoStoreId}/menu/updates`,
      data,
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
    const { glovoStoreId, glovoOrderId, status } = data
    const { glovoToken, production }: AppSettings = await Glovo.getAppSettings(
      ctx
    )

    const environment = production ? PRODUCTION : STAGING

    const payload: { status: string } = {
      status,
    }

    return this.http.put(
      `${BASE_URL[environment]}/webhook/stores/${glovoStoreId}/orders/${glovoOrderId}/status`,
      payload,
      {
        headers: {
          Authorization: glovoToken,
        },
      }
    )
  }

  public modifyOrder = async (ctx: any, data: GlovoModifyOrderPayload) => {
    const {
      glovoToken,
      production,
    }: { glovoToken: string; production: boolean } = await Glovo.getAppSettings(
      ctx
    )

    const environment = production ? PRODUCTION : STAGING

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
      `${BASE_URL[environment]}/webhook/stores/${storeId}/orders/${glovoOrderId}/replace_products`,
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
