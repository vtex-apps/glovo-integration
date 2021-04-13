import {
  createSimulationPayload,
  isSkuAvailable,
  createSimulationItem,
} from '../utils'

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
      // We create a item with quantity one because Glovo doesn't take quantity, only if the product is available or not
      const simulationItem = createSimulationItem({ id: IdSku, quantity: 1 })

      const simulation = await checkout.simulation(
        ...createSimulationPayload({
          items: [simulationItem],
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
