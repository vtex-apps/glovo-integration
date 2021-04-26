import { createVtexOrderData } from '../utils'

export async function createOrder(ctx: Context, next: () => Promise<void>) {
  const {
    state: { glovoOrder, orderSimulation, affiliateInfo },
    clients: { orders },
  } = ctx

  const { salesChannel, affiliateId } = affiliateInfo

  const vtexOrderData = createVtexOrderData(glovoOrder, orderSimulation)

  const vtexOrder = await orders.createOrder(
    vtexOrderData,
    salesChannel,
    affiliateId
  )

  ctx.state.vtexOrder = vtexOrder

  await next()
}
