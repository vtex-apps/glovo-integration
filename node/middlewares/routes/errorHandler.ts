export async function errorHandler(ctx: Context, next: () => Promise<void>) {
  const {
    vtex: { logger },
  } = ctx

  try {
    await next()
  } catch (error) {
    logger.error({
      // glovoOrder: ctx.state?.glovoOrder ?? 'No Glovo order information',
      message: error.message,
      status: error.status,
      reason: error.reason,
      workflowType: error.workflowType,
      workflowInstance: error.workflowInstance,
      payload: error.payload,
      error: error.error,
    } as CustomError.Data)

    ctx.status = error.status || 500
    ctx.body = error.reason
    ctx.app.emit('error', error, ctx)
  }
}
