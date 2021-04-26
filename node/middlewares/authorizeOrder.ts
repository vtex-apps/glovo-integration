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

  logger.info({
    message: `Order ${marketplaceOrderId} has been placed.`,
    order,
  })
  ctx.status = 201
  ctx.body = order
}
