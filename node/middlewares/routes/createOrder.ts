import {
  ServiceError,
  createVtexOrderData,
  requestWithRetries,
} from '../../utils'

export async function createOrder(ctx: Context) {
  const {
    state: {
      glovoOrder,
      orderSimulation,
      storeInfo,
      marketplace,
      clientProfileData,
    },
    clients: { orders },
    vtex: { account },
  } = ctx

  const { salesChannel, affiliateId, sellerId } = storeInfo

  const vtexOrderData = createVtexOrderData(
    glovoOrder,
    orderSimulation,
    clientProfileData,
    marketplace,
    account
  )

  let createdOrder

  try {
    switch (marketplace && sellerId !== '1') {
      case true:
        createdOrder = await requestWithRetries<CreateMarketplaceOrderResponse>(
          orders.createMarketplaceOrder(
            vtexOrderData,
            salesChannel,
            affiliateId
          )
        )

        ctx.state.vtexOrder = createdOrder.orders[0]
        break

      default:
        createdOrder = await requestWithRetries<VTEXOrder[]>(
          orders.createOrder(vtexOrderData, salesChannel, affiliateId)
        )

        ctx.state.vtexOrder = createdOrder[0]
        break
    }
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
