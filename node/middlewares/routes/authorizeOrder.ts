import {
  createAuthorizationPayload,
  requestWithRetries,
  ServiceError,
} from '../../utils'

export async function authorizeOrder(ctx: Context, next: () => Promise<void>) {
  if (!ctx.state.vtexOrder) {
    /**
     * If the order doesn't exists,
     * we continue to the next middleware to create it.
     */
    await next()
  }

  const {
    state: { vtexOrder, storeInfo, marketplace, glovoOrder },
    clients: { orders },
    vtex: { logger },
  } = ctx

  const { salesChannel, affiliateId, sellerId } = storeInfo
  let orderIdentifier: string

  switch (marketplace) {
    case true: {
      orderIdentifier = vtexOrder.orderId
      break
    }

    default: {
      // eslint-disable-next-line no-case-declarations
      const order = vtexOrder as VTEXOrder

      orderIdentifier = order.marketplaceOrderId
      break
    }
  }

  const payload = createAuthorizationPayload(
    orderIdentifier,
    marketplace,
    glovoOrder
  )

  try {
    switch (marketplace && sellerId !== '1') {
      case true: {
        await requestWithRetries<VTEXAuthorizedOrder>(
          orders.authorizeMarketplaceOrder(
            payload as AuthorizeMarketplaceOrderPayload,
            orderIdentifier
          )
        )
        break
      }

      default: {
        await requestWithRetries<VTEXAuthorizedOrder>(
          orders.authorizeOrder(
            payload as AuthorizeOrderPayload,
            vtexOrder.orderId,
            salesChannel,
            affiliateId
          )
        )
        break
      }
    }

    logger.info({
      message: `Order ${orderIdentifier} has been placed.`,
    })
  } catch (error) {
    throw new ServiceError({
      message: error.message ?? 'Order creation failed',
      reason:
        error.reason ?? `Authorization for order ${orderIdentifier} failed`,
      metric: 'orders',
      data: error.data ?? { glovoOrder, vtexOrder },
      error: error.error ?? error.response?.data,
    })
  }
}
