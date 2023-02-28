import { createAuthorizationPayload, ServiceError } from '../../utils'

export async function authorizeOrder(ctx: Context, next: () => Promise<void>) {
  const {
    state: { vtexOrder, storeInfo, marketplace, glovoOrder },
    clients: { orders },
    vtex: { logger },
  } = ctx

  const { salesChannel, affiliateId, sellerId } = storeInfo
  let orderIdentifier: string

  switch (marketplace) {
    case true:
      orderIdentifier = vtexOrder.orderId
      break

    default:
      // eslint-disable-next-line no-case-declarations
      const orderInfo = vtexOrder as VTEXOrder

      orderIdentifier = orderInfo.marketplaceOrderId
      break
  }

  const payload = createAuthorizationPayload(
    orderIdentifier,
    marketplace,
    glovoOrder
  )

  let order

  try {
    switch (marketplace && sellerId !== '1') {
      case true:
        order = await orders.authorizeMarketplaceOrder(
          payload as AuthorizeMarketplaceOrderPayload,
          orderIdentifier
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
      message: `Order ${orderIdentifier} has been placed.`,
      order,
    })

    ctx.state.vtexOrder = vtexOrder

    await next()
  } catch (error) {
    throw new ServiceError({
      message: error.message,
      reason:
        error.reason ?? `Authorization for order ${orderIdentifier} failed`,
      metric: 'orders',
      data: { glovoOrder, vtexOrder },
      error: error.response?.data,
    })
  }
}
