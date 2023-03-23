import { requestWithRetries, ServiceError } from '../../utils'

export async function checkOrderRecord(
  ctx: Context,
  next: () => Promise<void>
) {
  const {
    clients: { recordsManager },
    state: { glovoOrder, storeInfo },
  } = ctx

  const orderId = `${storeInfo.affiliateId}-${glovoOrder.order_id}-01`

  try {
    const orderRecord = await requestWithRetries<OrderRecord>(
      recordsManager.getOrderRecord(orderId)
    )

    if (orderRecord?.vtexOrder) {
      ctx.state.vtexOrder = orderRecord.vtexOrder
    }

    await next()
  } catch (error) {
    throw new ServiceError({
      message: error.message ?? 'Order creation failed',
      reason:
        error.reason ??
        `Store information for ${glovoOrder.store_id} not found. Check integration settings.`,
      metric: 'orders',
      data: error.data ?? glovoOrder,
      error: error.error ?? error.response?.data,
    })
  }
}
