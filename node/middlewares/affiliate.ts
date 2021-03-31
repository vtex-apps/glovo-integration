import { createSimulationPayload, isSkuAvailable } from '../utils'

export async function affiliate(ctx: Context, next: () => Promise<void>) {
  const {
    state: { glovoToken, affiliateInfo, catalogUpdate },
    clients: { glovo, checkout },
    vtex: { logger },
  } = ctx

  const { IsActive, IdSku, IdAffiliate } = catalogUpdate

  const { salesChannel, glovoStoreId } = affiliateInfo

  let glovoPayload = {
    glovoToken,
    skuId: IdSku,
    glovoStoreId,
    sellingPrice: 0,
    available: false,
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

      if (isSkuAvailable(item)) {
        const { sellingPrice } = item

        glovoPayload = {
          ...glovoPayload,
          sellingPrice,
          available: true,
        }
      }
    }

    await glovo.api(glovoPayload)

    logger.info({
      glovoPayload,
      catalogUpdate,
    })
  } catch (error) {
    throw new Error(error)
  }

  ctx.status = 204
  await next()
}
