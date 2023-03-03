/* eslint-disable @typescript-eslint/naming-convention */
import { isValidAffiliateId, ServiceError } from '../../utils'

export async function modifyGlovoOrder(
  ctx: StatusChangeContext,
  next: () => Promise<void>
) {
  const {
    body,
    clients: { glovo, orders, recordsManager },
    state: { glovoToken, stores },
    vtex: { logger },
  } = ctx

  const { orderId } = body
  const [orderIdAffiliate] = orderId.split('-')

  /**
   * Check if the order comes from Glovo and remove the affiliateId (i.e. 'TST') from the VTEX orderId to get the glovoOrderId.
   */
  if (!isValidAffiliateId(orderIdAffiliate, stores)) {
    logger.warn({
      message: 'Glovo order not modified',
      reason: 'AffiliateId not valid',
      data: body,
    })

    return
  }

  try {
    const order = await orders.getOrder(orderId)

    if (!order.changesAttachment) {
      return
    }

    const {
      changesAttachment: { changesData },
    } = order

    const removedProducts: string[] = []
    const addedProducts: GlovoModifiedProduct[] = []

    for (const change of changesData) {
      for (const item of change.itemsAdded) {
        addedProducts.push({
          id: item.id,
          quantity: item.quantity,
          attributes: [],
        })
      }

      for (const item of change.itemsRemoved) {
        removedProducts.push(item.id)
      }
    }

    const orderRecord = await recordsManager.getOrderRecord(orderId)

    if (!orderRecord) {
      throw new Error(`The record for the order ${orderId} was not found`)
    }

    const {
      glovoOrder: { order_id, store_id },
    } = orderRecord

    const payload: GlovoModifyOrderPayload = {
      glovoStoreId: store_id,
      glovoOrderId: order_id,
      replacements: [],
      removed_purchases: removedProducts,
      added_products: addedProducts,
    }

    logger.info({
      message: `Glovo order ${order_id} payload for modification`,
      data: payload,
    })

    const modifiedGlovoOrder = await glovo.modifyOrder(payload, glovoToken)

    const data: OrderRecord = {
      ...orderRecord,
      invoiced: order,
      hasChanged: true,
      invoicedAt: new Date().getTime(),
    }

    await recordsManager.saveOrderRecord(orderId, data)

    logger.info({
      message: `Glovo order ${order_id} was modified successfully`,
      data: modifiedGlovoOrder,
    })

    await next()
  } catch (error) {
    throw new ServiceError({
      message: error.message,
      reason: error.reason ?? `Order modification for order ${orderId} failed`,
      metric: 'orders',
      data: { body },
      error: error.response?.data,
    })
  }
}
