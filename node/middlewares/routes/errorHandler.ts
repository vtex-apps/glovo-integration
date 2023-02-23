export async function errorHandler(ctx: Context, next: () => Promise<void>) {
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
      glovoOrder: ctx.state?.glovoOrder ?? 'No Glovo order information',
      message,
      status,
      reason,
      workflowType,
      workflowInstance,
      payload,
      error,
    } as CustomError.Data)

    ctx.status = error.status || 500
    ctx.body = error.reason
    ctx.app.emit('error', error, ctx)
  }
}
