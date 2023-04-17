/* eslint-disable @typescript-eslint/naming-convention */
import { getChangedItems, isValidAffiliateId, ServiceError } from '../../utils'

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

    const replacements: GlovoModifyReplacement[] = []
    const removedProducts: string[] = []
    const addedProducts: GlovoModifiedProduct[] = []
    const changedItems = getChangedItems(changesData)

    if (Object.keys(changedItems).length <= 0) {
      return
    }

    // Replacements and removed products
    for (const product of products) {
      const { id } = product

      if (!changedItems[id]) {
        continue
      }

      const updatedQuantity = product.quantity + changedItems[id].quantity

      if (updatedQuantity <= 0) {
        removedProducts.push(product.purchased_product_id)
      } else {
        replacements.push({
          purchased_product_id: product.purchased_product_id,
          product: {
            id,
            quantity: updatedQuantity,
            attributes: product.attributes,
          },
        })
      }
    }

    // Added products
    const itemsInOrder = products.map((product) => product.id)

    for (const [id, item] of Object.entries(changedItems)) {
      if (!itemsInOrder.includes(id)) {
        addedProducts.push({
          id,
          quantity: item.quantity,
          attributes: [],
        })
      }
    }

    const payload: GlovoModifyOrderPayload = {
      glovoStoreId: store_id,
      glovoOrderId: order_id,
      replacements,
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
      message: `Order modification for order ${orderId} failed`,
      reason: error.message,
      metric: 'orders',
      data: { body },
    })
  }
}
