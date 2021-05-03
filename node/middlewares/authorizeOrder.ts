export async function authorizeOrder(ctx: Context, next: () => Promise<void>) {
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
    message: `Order ${orderId} has been placed.`,
    order,
  })
  ctx.status = 201
  ctx.state.vtexOrder = vtexOrder

  await next()
}
