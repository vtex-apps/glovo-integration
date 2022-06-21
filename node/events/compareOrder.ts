/* eslint-disable @typescript-eslint/naming-convention */
import {
  CustomError,
  convertGlovoProductsToCompare,
  getStoreInfoFromAffiliateId,
} from '../utils'

export async function compareOrder(
  ctx: StatusChangeContext,
  next: () => Promise<void>
) {
  const {
    body,
    clients: { glovo, orders, recordsManager },
    state: { stores },
    vtex: { logger },
  } = ctx

  const { orderId } = body

  // Filter orders that don't come form sellers (Example: 1234661638608-01)
  if (Number(orderId.slice(0, 3))) {
    logger.warn({
      message: 'Received order without affiliateId',
      data: body,
    })

    return
  }

  try {
    const orderAffiliateId = orderId.slice(0, 3)
    const storeInfo = getStoreInfoFromAffiliateId(orderAffiliateId, stores)

    if (!storeInfo) {
      throw new CustomError({
        message: `Store information not found for order modification for order ${orderId}`,
        status: 500,
        payload: { body },
      })
    }

    // fetch order's information
    if (orderId.includes('-')) {
      orderId.slice(0, -3)
    }

    const order = await orders.getOrder(orderId)
    const orderRecord = await recordsManager.getOrderRecord(orderId)

    if (!orderRecord) {
      throw new CustomError({
        message: `The record for the order ${orderId} was not found`,
        status: 500,
        payload: { stores, affiliateId: orderAffiliateId },
      })
    }

    // check if order has changed
    const {
      glovoOrder: { products },
    } = orderRecord

    const { items: invoicedItems } = order
    const receivedItems = convertGlovoProductsToCompare(products)

    const comparison: any = {}
    const replacements = []
    const removed_purchases = []

    for (const invoicedItem of invoicedItems) {
      // check if the comparison object already contains the item
      if (comparison[invoicedItem.id]) {
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        comparison[invoicedItem.id].quantity += invoicedItem.quantity
      } else {
        comparison[invoicedItem.id] = invoicedItem
      }
    }

    for (const receivedItem of receivedItems) {
      // check if the item was in stock and invoiced
      if (!comparison[receivedItem.id]) {
        removed_purchases.push(receivedItem.purchased_product_id)

        continue
      }

      // check if the item changed
      if (comparison[receivedItem.id].quantity !== receivedItem.quantity) {
        const updatedProduct: GlovoModifyReplacements = {
          purchased_product_id: receivedItem.purchased_product_id,
          product: {
            id: receivedItem.id,
            quantity: receivedItem.quantity,
            attributes: [],
          },
        }

        replacements.push(updatedProduct)
      }
    }

    /**
     *  Modify glovo order if it has changed and update the order record
     */
    let hasChanged = false

    if (replacements.length || removed_purchases.length) {
      const {
        glovoOrder: { order_id: glovoOrderId, store_id: glovoStoreId },
      } = orderRecord

      const payload: GlovoModifyOrderPayload = {
        glovoStoreId,
        glovoOrderId,
        replacements,
        removed_purchases,
        added_products: [],
      }

      hasChanged = true

      const modifiedGlovoOrder = await glovo.modifyOrder(ctx, payload)

      logger.info({
        message: `Glovo order ${glovoOrderId} was modified successfully`,
        data: modifiedGlovoOrder,
      })
    }

    const currentDate = new Date()

    const data: OrderRecord = {
      ...orderRecord,
      invoiced: order,
      hasChanged,
      invoicedAt: currentDate.getTime(),
    }

    await recordsManager.saveOrderRecord(orderId, data)

    await next()
  } catch (error) {
    throw new CustomError({
      message: `Order comparison for order ${orderId} failed`,
      status: 500,
      payload: error,
      error,
    })
  }
}
