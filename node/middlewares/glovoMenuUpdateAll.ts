import { updateGlovoMenuAll } from '../utils'

export async function glovoMenuUpdateAll(
  ctx: Context,
  next: () => Promise<void>
) {
  const {
    vtex: { logger },
  } = ctx

  // Send response to VTEX Notificator to avoid retries
  await next()

  try {
    updateGlovoMenuAll(ctx)
  } catch (error) {
    logger.error({
      message: `There was a problem updating the Glovo menu`,
      data: error,
    })

    return error
  }
}
