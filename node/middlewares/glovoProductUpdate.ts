import { json } from 'co-body'

import { updateGlovoProduct } from '../utils'

export async function glovoProductUpdate(
  ctx: Context,
  next: () => Promise<void>
) {
  const catalogUpdate: CatalogChange = await json(ctx.req)

  // Send response to VTEX Notificator to avoid retries.
  await next()

  try {
    const updatedProduct = await updateGlovoProduct(ctx, catalogUpdate)

    ctx.status = 200
    ctx.body = updatedProduct
  } catch (error) {
    throw new Error(
      `Product with sku ${catalogUpdate.IdSku} could not be updated`
    )
  }
}
