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
      orderId: ctx.body.orderId ?? 'No orderId information',
      message: error.message,
      reason: error.reason,
      metric: error.metric,
      data: error.data,
      error: error.error,
    })

    ctx.body = error.reason
  }
}
