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
    throw new CustomError({
      message: `Order creation for order Glovo Order ${glovoOrder.order_id} failed`,
      status: 500,
      payload: { glovoOrder, orderSimulation },
    })
  }
}
