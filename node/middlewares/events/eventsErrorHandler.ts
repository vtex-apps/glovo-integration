export async function eventsErrorHandler(
  ctx: StatusChangeContext,
  next: () => Promise<void>
) {
  const {
    vtex: { logger },
  } = ctx

  try {
    await next()
  } catch (error) {
    logger.error({
      orderId: ctx.body.orderId ?? null,
      message: error.message,
      reason: error.reason,
      status: error.status,
      payload: error.payload,
      data: error.error,
    })

    ctx.body = error.reason
  }
}
