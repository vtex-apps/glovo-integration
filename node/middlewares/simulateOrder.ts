import { UserInputError } from '@vtex/api'
import { json } from 'co-body'

import {
  convertGlovoProductToItems,
  createSimulationPayload,
  getStoreInfoFormGlovoStoreId,
} from '../utils'

export async function simulateOrder(ctx: Context, next: () => Promise<void>) {
  const {
    state: { storesConfig },
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
    storesConfig
  ) as StoreInfo

  if (!storeInfo) {
    throw new UserInputError(
      `Order not handled. Missing or invalid store with Glovo Store Id ${glovoOrder.store_id}`
    )
  }

  const { salesChannel, storeId, postalCode, country } = storeInfo

  try {
    const simulationItems = convertGlovoProductToItems(glovoOrder.products)
    const simulation = await checkout.simulation(
      ...createSimulationPayload({
        items: simulationItems,
        postalCode,
        country,
        salesChannel,
        storeId,
      })
    )

    logger.info({
      message: `Simulation for order ${glovoOrder.order_id}`,
      simulation,
      glovoOrder,
    })

    ctx.state.orderSimulation = simulation
    ctx.state.storeInfo = storeInfo

    await next()
  } catch (error) {
    throw new Error(
      `There was a problem with the simulation for order ${glovoOrder.order_id}`
    )
  }
}
