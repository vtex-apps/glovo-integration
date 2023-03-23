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
    return
  }

  try {
    let order: VTEXOrder

    try {
      order = await orders.getOrder(orderId)
    } catch (error) {
      throw new Error(`Error fetching order ${orderId}`)
    }

    if (!order.changesAttachment) {
      return
    }

    let orderRecord: OrderRecord

    try {
      orderRecord = await recordsManager.getOrderRecord(orderId)
    } catch (error) {
      throw new Error(`The record for the order ${orderId} was not found`)
    }

    const {
      glovoOrder: { order_id, store_id, products },
    } = orderRecord

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
        for (const product of products) {
          if (item.id === product.id) {
            removedProducts.push(product.purchased_product_id)
          }
        }
      }
    }

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

    let modifiedGlovoOrder

    try {
      modifiedGlovoOrder = await glovo.modifyOrder(payload, glovoToken)
    } catch (error) {
      throw new Error(`Unable to modify Glovo order for order ${orderId}`)
    }

    const data: OrderRecord = {
      ...orderRecord,
      vtexOrder: order,
      hasChanged: true,
      invoicedAt: new Date().toISOString(),
    }

    await recordsManager.saveOrderRecord(orderId, data)

    logger.info({
      message: `Glovo order ${order_id} was modified successfully`,
      data: modifiedGlovoOrder,
    })

    await next()
  } catch (error) {
    throw new ServiceError({
      message: `Order modification for order ${orderId} failed`,
      reason: error.message,
      metric: 'orders',
      data: { body },
    })
  }
}
