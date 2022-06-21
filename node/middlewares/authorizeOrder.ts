import { CustomError, createAuthorizationPayload } from '../utils'

export async function authorizeOrder(ctx: Context, next: () => Promise<void>) {
  const {
    state: { vtexOrder, storeInfo, marketplace, glovoOrder },
    clients: { orders },
    vtex: { logger },
  } = ctx

  const { salesChannel, affiliateId, sellerId } = storeInfo
  let id: string

  switch (marketplace) {
    case true:
      id = vtexOrder.orderId
      break

    default:
      // eslint-disable-next-line no-case-declarations
      const orderInfo = vtexOrder as VTEXOrder

      id = orderInfo.marketplaceOrderId
      break
  }

  const payload = createAuthorizationPayload(id, marketplace, glovoOrder)

  let order

  try {
    switch (marketplace && sellerId !== '1') {
      case true:
        order = await orders.authorizeMarketplaceOrder(
          payload as AuthorizeMarketplaceOrderPayload,
          id
        )
        break

      default:
        order = await orders.authorizeOrder(
          payload as AuthorizeOrderPayload,
          vtexOrder.orderId,
          salesChannel,
          affiliateId
        )
        break
    }

    logger.info({
      message: `Order ${id} has been placed.`,
      order,
    })
    ctx.status = 201
    ctx.state.vtexOrder = vtexOrder

    await next()
  } catch (error) {
    if (error) throw error

    throw new CustomError({
      message: `Authorization for order ${id} failed`,
      status: error.status,
      payload: error,
    })
  }
}
