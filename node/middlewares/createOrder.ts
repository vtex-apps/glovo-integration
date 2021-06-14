import { createVtexOrderData } from '../utils'

export async function createOrder(ctx: Context, next: () => Promise<void>) {
  const {
    state: { glovoOrder, orderSimulation, affiliateInfo, clientProfileData },
    clients: { orders },
  } = ctx

  const { salesChannel, affiliateId } = affiliateInfo

  try {
    const vtexOrderData = createVtexOrderData(
      glovoOrder,
      orderSimulation,
      clientProfileData
    )

    const vtexOrder = await orders.createOrder(
      vtexOrderData,
      salesChannel,
      affiliateId
    )

    ctx.state.vtexOrder = vtexOrder

    await next()
  } catch (error) {
    throw new Error(error)
  }
}
