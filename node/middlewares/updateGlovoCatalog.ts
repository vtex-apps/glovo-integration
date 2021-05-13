import { json } from 'co-body'

import { updateGlovoProduct } from '../utils'

export async function updateGlovoCatalog(
  ctx: Context,
  next: () => Promise<void>
) {
  // Send response to VTEX Notificator
  const catalogUpdate: CatalogChange = await json(ctx.req)

  await next()

  updateGlovoProduct(ctx, catalogUpdate)
}
