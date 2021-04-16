export async function authorizeOrder(ctx: Context) {
  const {
    state: { vtexOrder, affiliateInfo },
    clients: { orders },
    vtex: { logger },
  } = ctx

  const [{ marketplaceOrderId, orderId }] = vtexOrder
  const { salesChannel, affiliateId } = affiliateInfo

  const payload = {
    marketplaceOrderId,
  }

  const order = await orders.authorizeOrder(
    payload,
    orderId,
    salesChannel,
    affiliateId
  )

  logger.info({ message: 'Order placed', order })
  ctx.status = 204
  ctx.body = order
}
