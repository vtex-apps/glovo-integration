export async function errorHandler(ctx: Context, next: () => Promise<void>) {
  const {
    vtex: { logger },
  } = ctx

  try {
    await next()
  } catch (error) {
    // If the Glovo order was received, add the order id to the log.
    if (ctx.state.glovoOrder) {
      const { order_id: orderId } = ctx.state.glovoOrder

      logger.error({
        orderId,
        message: error.message,
        error: error.resonse,
      })
    } else {
      logger.error({
        message: error.message,
        status: error.status,
        error: error.response,
      })
    }

    ctx.status = error.status || 500
    ctx.body = error.message
    ctx.app.emit('error', error, ctx)
  }
}
