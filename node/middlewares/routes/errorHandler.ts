export async function errorHandler(ctx: Context, next: () => Promise<void>) {
  const {
    vtex: { logger },
  } = ctx

  try {
    await next()
  } catch (error) {
    logger.error({
      glovoOrder: ctx.state?.glovoOrder ?? 'No Glovo order information',
      message: error.message,
      reason: error.reason,
      metric: error.metric,
      data: error.data,
      error: error.error,
    })

    ctx.type = 'json'
    ctx.status = 500
    ctx.body = {
      message: error.message,
      reason: error.reason,
    }
    ctx.app.emit('error', error, ctx)
  }
}
