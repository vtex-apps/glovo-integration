export async function eventsErrorHandler(
  ctx: StatusChangeContext,
  next: () => Promise<void>
) {
  const {
    vtex: { logger },
  } = ctx

  try {
    await next()
  } catch (err) {
    const {
      message,
      reason,
      status,
      workflowType,
      workflowInstance,
      payload,
      error,
    } = err

    logger.error({
      orderId: ctx.body.orderId ?? 'No orderId information',
      message,
      reason,
      status,
      workflowType,
      workflowInstance,
      payload,
    } as CustomError.Data)

    ctx.body = error.reason
  }
}
