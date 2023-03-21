import { requestWithRetries, ServiceError } from '../../utils'

export async function saveOrderRecord(ctx: Context) {
  const {
    clients: { recordsManager },
    state: { glovoOrder, vtexOrder },
  } = ctx

  const { orderId } = vtexOrder

  const orderRecordData: OrderRecord = {
    orderId,
    glovoOrder,
    vtexOrder,
    hasChanged: false,
    createdAt: new Date().toISOString(),
  }

  try {
    await requestWithRetries(
      recordsManager.saveOrderRecord(orderId, orderRecordData)
    )

    ctx.status = 201
  } catch (error) {
    throw new ServiceError({
      message: 'Order creation failed',
      reason: `Unable to save order record for order ${orderId}`,
      metric: 'orders',
      data: orderRecordData,
      error,
    })
  }
}
