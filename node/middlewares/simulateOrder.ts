import { json } from 'co-body'

import {
  convertGlovoProductToItems,
  createSimulationPayload,
  getStoreInfoFormGlovoStoreId,
} from '../utils'
import { CustomError } from '../utils/customError'

export async function simulateOrder(ctx: Context, next: () => Promise<void>) {
  const {
    state: { stores },
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

  const storeInfo = getStoreInfoFormGlovoStoreId(
    glovoOrder.store_id,
    stores
  ) as StoreInfo

  if (!storeInfo) {
    throw new CustomError({
      message: `Order not handled. Missing or invalid store with Glovo Store Id ${glovoOrder.store_id}`,
      status: 500,
      payload: glovoOrder,
    })
  }

  const { sellerId, salesChannel, affiliateId, postalCode, country } = storeInfo

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

  try {
    const simulation = await checkout.simulation(...simulationPayload)

    if (!simulation.items.length) {
      logger.error({
        message: `No items were returned from simulation for Glovo Order ${glovoOrder.order_id}`,
        status: 500,
        payload: glovoOrder,
      })
    }

    logger.info({
      message: `Simulation for order ${glovoOrder.order_id}`,
      simulation,
      glovoOrder,
    })

    ctx.state.orderSimulation = simulation
    ctx.state.storeInfo = storeInfo

    await next()
  } catch (error) {
    throw new CustomError({
      message: `Simulation failed for Glovo Order ${glovoOrder.order_id}`,
      status: 500,
      payload: { glovoOrder, simulationPayload },
    })
  }
}
