import { createSimulationPayload, isSkuAvailable } from '../utils'

export async function updateProduct(ctx: Context, next: () => Promise<void>) {
  const {
    state: { glovoToken, affiliateInfo, catalogUpdate },
    clients: { glovo, checkout },
    vtex: { logger },
  } = ctx

  const { IsActive, IdSku, IdAffiliate } = catalogUpdate
  const { salesChannel, glovoStoreId } = affiliateInfo

  let glovoPayload = {
    glovoToken,
    price: 0,
    available: false,
    skuId: IdSku,
    glovoStoreId,
  }

  try {
    if (IsActive) {
      const simulation = await checkout.simulation(
        ...createSimulationPayload({
          skuId: IdSku,
          salesChannel,
          affiliateId: IdAffiliate,
        })
      )

      const { items } = simulation
      const [item] = items

      // eslint-disable-next-line no-console
      console.log('Item:', item)

      if (isSkuAvailable(item)) {
        const { sellingPrice } = item

        glovoPayload = {
          ...glovoPayload,
          price: sellingPrice,
          available: true,
        }
      }
    }

    // eslint-disable-next-line no-console
    console.log('GlovoPayload: ', glovoPayload)

    await glovo.updateProducts(glovoPayload)
    logger.info({ glovoPayload, catalogUpdate })
  } catch (error) {
    throw new Error(error)
  }

  ctx.status = 204

  await next()
}
