import { json } from 'co-body'

import { updateGlovoProduct } from '../utils'

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
    const updatedProduct = await updateGlovoProduct(ctx, catalogUpdate)

    ctx.status = 200
    ctx.body = updatedProduct
  } catch (error) {
    logger.error({
      message: `There was a problem updating product with sku ${catalogUpdate.IdSku} on store with ID ${catalogUpdate.IdAffiliate}`,
      data: error,
    })

    return error
  }
}
