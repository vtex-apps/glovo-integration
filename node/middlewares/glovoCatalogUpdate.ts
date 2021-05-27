import { updateGlovoCatalog } from '../utils'

export async function glovoCatalogUpdate(
  ctx: Context,
  next: () => Promise<void>
) {
  const {
    vtex: { logger },
  } = ctx

  // Send response to VTEX Notificator to avoid retries
  await next()

  try {
    updateGlovoCatalog(ctx)
  } catch (error) {
    logger.error({
      message: `There was a problem updating the Glovo Menu`,
      data: error,
    })

    return error
  }
}
