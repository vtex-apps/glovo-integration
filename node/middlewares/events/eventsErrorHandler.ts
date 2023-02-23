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
      status: error.status,
      workflowType: error.workflowType,
      workflowInstance: error.workflowInstance,
      payload: error.payload,
      error: error.error,
    } as CustomError.Data)

    ctx.body = error.reason
  }
}
