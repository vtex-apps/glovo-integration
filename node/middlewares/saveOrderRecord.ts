import { ORDERS } from '../constants'

export async function saveOrderRecord(ctx: Context) {
  const {
    clients: { vbase },
    state: { glovoOrder, vtexOrder },
  } = ctx

  const [{ orderId }] = vtexOrder
  const currentDate = new Date()
  const data: OrderRecord = {
    orderId,
    glovoOrder,
    invoiced: null,
    hasChanged: false,
    createdAt: currentDate.toISOString(),
  }

  const orderRecord = await vbase.saveJSON(ORDERS, orderId, data)

  ctx.status = 201
  ctx.body = orderRecord
}
