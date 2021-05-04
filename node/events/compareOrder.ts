/* eslint-disable @typescript-eslint/naming-convention */
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
    }

    // check if the item changed
    if (comparison[receivedItem.id].quantity !== receivedItem.quantity) {
      const updatedProduct: GlovoUpdatedProduct = {
        purchased_product_id: comparison[receivedItem.id].purchased_product_id,
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
      glovoOrder: { order_id: glovoOrderId, store_id: storeId },
    } = orderRecord

    const payload: GlovoModifyOrderPayload = {
      storeId,
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
    invoiced: invoicedOrder,
    hasChanged,
    invoicedAt: currentDate.toISOString(),
  }

  await vbase.saveJSON(ORDERS, orderId, data)

  await next()
}
