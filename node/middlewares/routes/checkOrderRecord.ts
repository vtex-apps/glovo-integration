import { json } from 'co-body'

import { getStoreInfoFormGlovoStoreId, ServiceError } from '../../utils'

export async function checkOrderRecord(
  ctx: Context,
  next: () => Promise<void>
) {
  const {
    clients: { recordsManager },
    state: { stores },
    vtex: { logger },
  } = ctx

  const glovoOrder: GlovoOrder = await json(ctx.req)

  logger.info({
    message: `Received order ${glovoOrder.order_id} from store ${glovoOrder.store_id} from Glovo`,
    glovoOrder,
  })

  const storeInfo = getStoreInfoFormGlovoStoreId(glovoOrder.store_id, stores)

  if (!storeInfo) {
    throw new Error('Store information not found. Check integration settings.')
  }

  const orderId = `${storeInfo.affiliateId}-${glovoOrder.order_id}-01`

  try {
    const orderRecord = await recordsManager.getOrderRecord(orderId)

    if (orderRecord) {
      ctx.state.orderId = orderId
    }

    ctx.state.glovoOrder = glovoOrder
    ctx.state.storeInfo = storeInfo

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
