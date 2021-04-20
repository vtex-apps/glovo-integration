import {
  createSimulationPayload,
  isSkuAvailable,
  createSimulationItem,
} from '../utils'

export async function updateProduct(ctx: Context) {
  const {
    state: { affiliateInfo, catalogUpdate },
    clients: { glovo, checkout },
    vtex: { logger },
  } = ctx

  const { IsActive, IdSku, IdAffiliate } = catalogUpdate
  const { salesChannel, glovoStoreId } = affiliateInfo

  let glovoPayload: GlovoUpdateProduct = {
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
        const { price, listPrice, unitMultiplier } = item

        glovoPayload = {
          ...glovoPayload,
          price: (Math.max(price, listPrice) * unitMultiplier) / 100,
          available: true,
        }
      }
    }

    await glovo.updateProducts(ctx, glovoPayload)

    logger.info({ message: 'Product updated', glovoPayload })
    ctx.status = 204
  } catch (error) {
    throw new Error(error)
  }
}
