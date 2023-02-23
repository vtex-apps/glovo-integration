import { CustomError, createVtexOrderData } from '../../utils'

export async function createOrder(ctx: Context, next: () => Promise<void>) {
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

  try {
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

    await next()
  } catch (error) {
    throw new CustomError({
      message: error.message,
      reason:
        error.reason ??
        `Order creation for order Glovo Order ${glovoOrder.order_id} failed`,
      status: error.statusCode ?? 500,
      workflowType: error.workflowType ?? 'Orders',
      workflowInstance: error.workflowInstance ?? 'Creation',
      payload: error.payload ?? { glovoOrder },
      error: error.error ?? error.response?.data,
    })
  }
}
