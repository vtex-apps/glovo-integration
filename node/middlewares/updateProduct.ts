import {
  createSimulationPayload,
  isSkuAvailable,
  createSimulationItem,
} from '../utils'

export async function updateProduct(ctx: Context, next: () => Promise<void>) {
  const {
    state: { glovoToken, affiliateInfo, catalogUpdate },
    clients: { glovo, checkout },
    vtex: { logger },
  } = ctx

  const { IsActive, IdSku, IdAffiliate } = catalogUpdate
  const { salesChannel, glovoStoreId } = affiliateInfo

  let glovoPayload: GlovoUpdateProduct = {
    glovoToken,
    available: false,
    skuId: IdSku,
    glovoStoreId,
  }

  try {
    if (IsActive) {
      const simulationItem = createSimulationItem({ id: IdSku, quantity: 1 })

      const simulation = await checkout.simulation(
        ...createSimulationPayload({
          items: [simulationItem],
          affiliateId: IdAffiliate,
          salesChannel,
        })
      )

      const { items } = simulation
      const [item] = items

      if (isSkuAvailable(item)) {
        const { sellingPrice } = item

        glovoPayload = {
          ...glovoPayload,
          price: sellingPrice / 100,
          available: true,
        }
      }
    }

    await glovo.updateProducts(glovoPayload)

    logger.info({ glovoPayload, catalogUpdate })
  } catch (error) {
    throw new Error(error)
  }

  ctx.status = 204

  await next()
}
