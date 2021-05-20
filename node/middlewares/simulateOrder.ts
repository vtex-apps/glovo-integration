import { UserInputError } from '@vtex/api'
import { json } from 'co-body'

import {
  convertGlovoProductToItems,
  createSimulationPayload,
  getAffiliateFromStoreId,
} from '../utils'

export async function simulateOrder(ctx: Context, next: () => Promise<void>) {
  const {
    state: { affiliateConfig },
    vtex: { logger },
    clients: { checkout },
  } = ctx

  const glovoOrder: GlovoOrder = await json(ctx.req)

  ctx.state.glovoOrder = glovoOrder

  // Log the order received from Glovo
  logger.info({
    message: `Received order ${glovoOrder.order_id} from store ${glovoOrder.store_id} from Glovo`,
    glovoOrder,
  })

  const affiliateInfo = getAffiliateFromStoreId(
    glovoOrder.store_id,
    affiliateConfig
  ) as AffiliateInfo

  if (!affiliateInfo) {
    throw new UserInputError(
      `Order not handled. Missing or invalid affiliate with Glovo Store Id ${glovoOrder.store_id}`
    )
  }

  const { salesChannel, affiliateId, postalCode } = affiliateInfo

  try {
    const simulationItems = convertGlovoProductToItems(glovoOrder.products)
    const simulation = await checkout.simulation(
      ...createSimulationPayload({
        items: simulationItems,
        postalCode,
        country: 'ESP',
        salesChannel,
        affiliateId,
      })
    )

    logger.info({
      message: `Simulation for order ${glovoOrder.order_id}`,
      simulation,
      glovoOrder,
    })

    ctx.state.orderSimulation = simulation
    ctx.state.affiliateInfo = affiliateInfo

    await next()
  } catch (error) {
    throw new Error(error)
  }
}
