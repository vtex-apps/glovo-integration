export async function updateGlovoOrder(
  ctx: StatusChangeContext,
  next: () => Promise<void>
) {
  const {
    body: { domain, orderId, currentState, currentChangeDate },
    clients: { glovo },
    state: { glovoToken, affiliateConfig },
    vtex: { logger },
  } = ctx

  const glovoPayload = {
    glovoToken,
    affiliateConfig,
    domain,
    orderId,
    currentState,
    currentChangeDate,
  }

  try {
    await glovo.updateOrderStatus(glovoPayload)
    logger.info(glovoPayload)
  } catch (error) {
    logger.error(error)
    throw new Error(error)
  }

  await next()
}
