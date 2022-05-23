import { updateGlovoMenuPartial } from '../utils'

export async function glovoMenuUpdatePartial(
  ctx: Context,
  next: () => Promise<void>
) {
  const {
    vtex: { logger },
  } = ctx

  // Send response to VTEX Notificator to avoid retries
  await next()

  try {
    updateGlovoMenuPartial(ctx)
  } catch (error) {
    logger.error({
      message: `There was a problem updating the Glovo menu`,
      data: error,
    })

    return error
  }
}
