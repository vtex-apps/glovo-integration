import { createVtexOrderData } from '../utils'

export async function createOrder(ctx: Context, next: () => Promise<void>) {
  const {
    state: { glovoOrder, orderSimulation, storeInfo, clientProfileData },
    clients: { orders },
  } = ctx

  const { salesChannel, storeId } = storeInfo

  try {
    const vtexOrderData = createVtexOrderData(
      glovoOrder,
      orderSimulation,
      clientProfileData
    )

    const vtexOrder = await orders.createOrder(
      vtexOrderData,
      salesChannel,
      storeId
    )

    ctx.state.vtexOrder = vtexOrder

    await next()
  } catch (error) {
    throw new Error(error)
  }
}
