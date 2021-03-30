import { json } from 'co-body'

export async function affiliate(ctx: Context, next: () => Promise<void>) {
  const {
    clients: { glovo },
    vtex: { logger },
  } = ctx

  const body: CatalogChange = await json(ctx.req)

  const {
    IsActive,
    HasStockKeepingUnitRemovedFromAffiliate: isRemovedFromAffiliate,
    PriceModified,
    StockModified,
  } = body

  try {
    if (!IsActive) {
      await glovo.isNotActive(body)
    } else if (isRemovedFromAffiliate) {
      await glovo.removedFromAffiliate(body)
    } else if (PriceModified) {
      await glovo.priceChanged(body)
    } else if (StockModified) {
      await glovo.stockChanged(body)
    }

    logger.info(body)
  } catch (error) {
    throw new TypeError(error)
  }

  ctx.status = 204
  await next()
}
