import { UserInputError } from '@vtex/api'
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
    throw new UserInputError(
      `Order not handled. Missing or invalid store with Glovo Store Id ${glovoOrder.store_id}`
    )
  }

  const { sellerId, salesChannel, affiliateId, postalCode, country } = storeInfo

  try {
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

    logger.info({
      message: `Simulation for order ${glovoOrder.order_id}`,
      simulation,
      glovoOrder,
    })

    ctx.state.orderSimulation = simulation
    ctx.state.storeInfo = storeInfo

    await next()
  } catch (error) {
    if (error) throw error

    throw new CustomError({
      message: error.statusText,
      status: error.status,
      payload: error,
    })
  }
}
