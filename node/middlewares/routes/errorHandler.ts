export async function errorHandler(ctx: Context, next: () => Promise<void>) {
  const {
    vtex: { logger },
  } = ctx

  try {
    await next()
  } catch (error) {
    logger.error({
      glovoOrder: ctx.state?.glovoOrder ?? null,
      message: error.message,
      status: error.status,
      reason: error.reason,
      payload: error.payload,
      error: error.error,
    })

    ctx.status = error.status || 500
    ctx.body = error.reason
    ctx.app.emit('error', error, ctx)
  }
}
