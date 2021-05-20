import { updateGlovoCatalog } from '../utils'

export async function glovoCatalogUpdate(
  ctx: Context,
  next: () => Promise<void>
) {
  // Send response to VTEX Notificator to avoid retries
  await next()

  try {
    updateGlovoCatalog(ctx)
  } catch (error) {
    return error
  }
}
