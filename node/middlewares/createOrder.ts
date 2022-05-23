import { createVtexOrderData } from '../utils'
import { CustomError } from '../utils/customError'

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
  } = ctx

  const { salesChannel, affiliateId, sellerId } = storeInfo

  if (!orderSimulation.items.length) {
    throw new Error(
      `No items were returned from simulation for Glovo Order ${glovoOrder.order_id}`
    )
  }

  try {
    const vtexOrderData = createVtexOrderData(
      glovoOrder,
      orderSimulation,
      clientProfileData
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
    if (error) throw error

    throw new CustomError({
      message: `Order creation for order ${glovoOrder.order_id} failed`,
      status: error.status,
      payload: error,
    })
  }
}
