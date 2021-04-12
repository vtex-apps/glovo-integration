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
    logger.error(error)
    ctx.body = error.message
  }
}
