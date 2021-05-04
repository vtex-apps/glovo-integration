import { ORDERS } from '../constants'

export async function getOrderRecord(ctx: Context) {
  const {
    clients: { vbase },
    query: { orderId },
  } = ctx

  try {
    const orderRecord = await vbase.getJSON<OrderRecord>(ORDERS, orderId)

    ctx.body = orderRecord
  } catch (error) {
    throw new Error(error)
  }
}
