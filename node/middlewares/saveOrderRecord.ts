import { CustomError } from '../utils'

export async function saveOrderRecord(ctx: Context) {
  const {
    clients: { recordsManager },
    state: { glovoOrder, vtexOrder },
  } = ctx

  const { orderId } = vtexOrder
  const currentDate = new Date()
  const data: OrderRecord = {
    orderId,
    glovoOrder,
    invoiced: null,
    hasChanged: false,
    createdAt: currentDate.getTime(),
  }

  try {
    await recordsManager.saveOrderRecord(orderId, data)

    ctx.status = 201
  } catch (error) {
    throw new CustomError({
      message: error.statusText,
      status: error.status,
      payload: error,
    })
  }
}
