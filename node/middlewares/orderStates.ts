export async function orderStates(
  ctx: StatusChangeContext,
  next: () => Promise<any>
) {

  const {
    body: { domain, orderId, currentState, currentChangeDate },
    clients: { glovo },
    vtex: { logger }
  } = ctx

  const glovoPayload = {
    domain,
    orderId,
    currentState,
    currentChangeDate
  }

  try {
    await glovo.api(glovoPayload)
    logger.info(glovoPayload)
  } catch (error) {
    throw new Error(error)
  }

  await next()
}
