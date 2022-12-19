/* eslint-disable @typescript-eslint/naming-convention */
import {
  CustomError,
  convertGlovoProductsToCompare,
  isValidAffiliateId,
} from '../../utils'

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
  const [orderIdAffiliate] = orderId.split('-')

  if (!isValidAffiliateId(orderIdAffiliate, stores)) {
    logger.warn({
      message: 'Glovo order status not modified',
      reason: 'AffiliateId not valid',
      data: body,
    })

    return
  }

  try {
    const order = await orders.getOrder(orderId)
    const orderRecord = await recordsManager.getOrderRecord(orderId)

    if (!orderRecord) {
      throw new CustomError({
        message: `The record for the order ${orderId} was not found`,
        status: 500,
        payload: { stores, affiliateId: orderIdAffiliate },
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

        continue
      }

      comparison[invoicedItem.id] = invoicedItem
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

    // eslint-disable-next-line no-console
    console.log({ replacements })

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
