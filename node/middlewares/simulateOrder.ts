import { json } from 'co-body'

import {
  convertGlovoProductToItems,
  createSimulationPayload,
  getAffilateFromStoreId,
} from '../utils'

export async function simulateOrder(ctx: Context, next: () => Promise<void>) {
  const {
    state: { affiliateConfig },
    vtex: { logger },
    clients: { checkout },
  } = ctx

  const glovoOrder: GlovoOrder = await json(ctx.req)

  const affiliateInfo = getAffilateFromStoreId(
    glovoOrder.store_id,
    affiliateConfig
  ) as AffiliateInfo

  /**
   * If the order received doesn't match any affilate on settings, we end the process.
   * We also log it to Splunk, since there might be wrong in the configuration.
   */
  if (!affiliateInfo) {
    const message = `Order not handled. Couldn't find any affiliate with Glovo Store Id ${glovoOrder.store_id}`

    logger.warn({
      message,
      glovoOrder,
    })

    ctx.body = message

    return
  }

  const { salesChannel, affiliateId } = affiliateInfo

  const simulationItems = convertGlovoProductToItems(glovoOrder.products)

  const simulation = await checkout.simulation(
    ...createSimulationPayload({
      items: simulationItems,
      salesChannel,
      affiliateId,
    })
  )

  logger.info({
    step: 'Simulation',
    simulationResult: simulation,
    glovoOrder,
  })

  ctx.state.orderSimulation = simulation

  await next()
}
