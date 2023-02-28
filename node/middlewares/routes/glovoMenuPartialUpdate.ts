import { updateGlovoPartialMenu } from '../../utils'

export async function glovoMenuPartialUpdate(
  ctx: Context,
  next: () => Promise<void>
) {
  const {
    vtex: { logger },
  } = ctx

  // Send response to VTEX Notificator to avoid retries
  await next()

  try {
    updateGlovoPartialMenu(ctx)
  } catch (error) {
    logger.error({
      message: `There was a problem updating the Glovo menu`,
      data: error.response?.data,
    })

    return error
  }
}
