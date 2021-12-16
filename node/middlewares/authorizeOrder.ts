export async function authorizeOrder(ctx: Context, next: () => Promise<void>) {
  const {
    state: { vtexOrder, storeInfo },
    clients: { orders },
    vtex: { logger },
  } = ctx

  const [{ marketplaceOrderId, orderId }] = vtexOrder
  const { salesChannel, storeId } = storeInfo

  const payload = {
    marketplaceOrderId,
  }

  try {
    const order = await orders.authorizeOrder(
      payload,
      orderId,
      salesChannel,
      storeId
    )

    logger.info({
      message: `Order ${orderId} has been placed.`,
      order,
    })
    ctx.status = 201
    ctx.state.vtexOrder = vtexOrder

    await next()
  } catch (error) {
    throw new Error(error)
  }
}
