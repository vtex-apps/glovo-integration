import { ServiceError, createVtexOrderData } from '../../utils'

export async function createOrder(ctx: Context, next: () => Promise<void>) {
  const {
    state: {
      glovoOrder,
      orderSimulation,
      storeInfo,
      marketplace,
      clientProfileData,
      orderId,
    },
    clients: { orders },
    vtex: { account },
  } = ctx

  try {
    if (!orderId) {
      const { salesChannel, affiliateId, sellerId } = storeInfo

      const vtexOrderData = createVtexOrderData(
        glovoOrder,
        orderSimulation,
        clientProfileData,
        marketplace,
        account
      )

      let createdOrder

      switch (marketplace && sellerId !== '1') {
        case true:
          createdOrder = await orders.createMarketplaceOrder(
            vtexOrderData,
            salesChannel,
            affiliateId
          )

          ctx.state.vtexOrder = createdOrder.orders[0]
          break

        default:
          createdOrder = await orders.createOrder(
            vtexOrderData,
            salesChannel,
            affiliateId
          )

          ctx.state.vtexOrder = createdOrder[0]
          break
      }
    }

    await next()
  } catch (error) {
    throw new ServiceError({
      message: error.message ?? 'Order creation failed',
      reason:
        error.reason ??
        `Order creation for order Glovo Order ${glovoOrder.order_id} failed`,
      metric: 'orders',
      data: error.data ?? { glovoOrder },
      error: error.error ?? error.response?.data,
    })
  }
}
