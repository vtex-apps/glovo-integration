import { json } from 'co-body'

import { updateGlovoProduct } from '../../utils'

export async function glovoProductUpdate(
  ctx: Context,
  next: () => Promise<void>
) {
  const {
    vtex: { logger },
  } = ctx

  const catalogUpdate: CatalogChange = await json(ctx.req)

  // Send response to VTEX Notificator to avoid retries.
  await next()

  try {
    updateGlovoProduct(ctx, catalogUpdate)
  } catch (error) {
    logger.error({
      message: `There was a problem updating ${catalogUpdate.IdSku} for affiliate ${catalogUpdate.IdAffiliate}`,
      data: error.reposense,
    })

    return error
  }
}
