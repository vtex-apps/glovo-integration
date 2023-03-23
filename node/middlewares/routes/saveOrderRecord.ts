import { requestWithRetries, ServiceError } from '../../utils'

export async function saveOrderRecord(ctx: Context, next: () => Promise<void>) {
  /**
   * We continue to create the order before creating the orderRecord
   */
  await next()

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

    ctx.body = `Order ${orderId} placed`

    return (ctx.status = 201)
  } catch (error) {
    throw new ServiceError({
      message: error.message ?? 'Order creation failed',
      reason:
        error.reason ?? `Unable to save order record for order ${orderId}`,
      metric: 'orders',
      data: error.data ?? orderRecordData,
      error: error.error ?? error,
    })
  }
}
