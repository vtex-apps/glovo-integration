import { CustomError } from '../../utils'

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
      message: error.message,
      reason: `Unable to save order record for order ${vtexOrder}`,
      status: error.statusCode ?? 500,
      payload: { orderId, orderRecord: data },
      error: error.response?.data,
    })
  }
}
