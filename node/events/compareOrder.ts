import { convertGlovoProductsToCompare } from '../utils'
import { ORDERS } from '../constants'

export async function compareOrder(
  ctx: StatusChangeContext,
  next: () => Promise<void>
) {
  const {
    body: { orderId },
    clients: { glovo, orders, vbase },
    vtex: { logger },
  } = ctx

  // fetch order's information
  const invoicedOrder = await orders.getOrder(orderId)
  const orderRecord = await vbase.getJSON<OrderRecord>(ORDERS, orderId, true)

  // check if order has changed
  const {
    glovoOrder: { products },
  } = orderRecord

  const { items: invoicedItems } = invoicedOrder
  const receivedItems = convertGlovoProductsToCompare(products)

  const comparison: any = {}
  const replacements = []

  for (const receivedItem of receivedItems) {
    comparison[receivedItem.id] = receivedItem
  }

  for (const invoicedItem of invoicedItems) {
    if (comparison[invoicedItem.id].quantity !== invoicedItem.quantity) {
      const updatedProduct: GlovoUpdatedProduct = {
        purchased_product_id: comparison[invoicedItem.id].purchased_product_id,
        product: {
          id: invoicedItem.id,
          quantity:
            comparison[invoicedItem.id].quantity - invoicedItem.quantity,
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

  if (replacements.length) {
    const {
      glovoOrder: { order_id: glovoOrderId, store_id: storeId },
    } = orderRecord

    const payload: GlovoModifyOrderPayload = {
      storeId,
      glovoOrderId,
      replacements,
      removed_purchases: [],
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
    invoiced: invoicedOrder,
    hasChanged,
    invoicedAt: currentDate.toISOString(),
  }

  await vbase.saveJSON(ORDERS, orderId, data)

  await next()
}
