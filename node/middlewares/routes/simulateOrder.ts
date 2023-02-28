import { json } from 'co-body'

import {
  convertGlovoProductToItems,
  createSimulationPayload,
  getStoreInfoFormGlovoStoreId,
  ServiceError,
} from '../../utils'

export async function simulateOrder(ctx: Context, next: () => Promise<void>) {
  const {
    state: { stores },
    vtex: { logger },
    clients: { checkout },
  } = ctx

  const glovoOrder: GlovoOrder = await json(ctx.req)

  try {
    ctx.state.glovoOrder = glovoOrder

    logger.info({
      message: `Received order ${glovoOrder.order_id} from store ${glovoOrder.store_id} from Glovo`,
      glovoOrder,
    })

    const storeInfo = getStoreInfoFormGlovoStoreId(
      glovoOrder.store_id,
      stores
    ) as StoreInfo

    if (!storeInfo) {
      throw new Error(
        `Order not handled. Missing or invalid store with Glovo Store Id ${glovoOrder.store_id}`
      )
    }

    const { sellerId, salesChannel, affiliateId, postalCode, country } =
      storeInfo

    const simulationItems = convertGlovoProductToItems(
      sellerId,
      glovoOrder.products
    )

    const simulationPayload = createSimulationPayload({
      items: simulationItems,
      affiliateId,
      salesChannel,
      postalCode,
      country,
    })

    logger.info({
      message: `Simulation payload for order ${glovoOrder.order_id}`,
      simulationPayload,
    })

    const simulation = await checkout.simulation(...simulationPayload)

    if (!simulation.items.length) {
      throw new Error(
        `No items were returned from simulation for Glovo Order ${glovoOrder.order_id}`
      )
    }

    logger.info({
      message: `Simulation for order ${glovoOrder.order_id}`,
      simulation,
    })

    ctx.state.orderSimulation = simulation
    ctx.state.storeInfo = storeInfo

    await next()
  } catch (error) {
    throw new ServiceError({
      message: error.message ?? 'Order simulation error',
      reason:
        error.reason ??
        `Simulation failed for Glovo Order ${glovoOrder.order_id}`,
      metric: 'orders',
      data: error.data ?? glovoOrder,
      error: error.error ?? error.response?.data,
    })
  }
}
