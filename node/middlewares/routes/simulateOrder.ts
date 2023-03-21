import {
  convertGlovoProductToItems,
  createSimulationPayload,
  ServiceError,
} from '../../utils'

export async function simulateOrder(ctx: Context, next: () => Promise<void>) {
  const {
    state: { glovoOrder, orderId, storeInfo },
    vtex: { logger },
    clients: { checkout },
  } = ctx

  try {
    if (!orderId) {
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
    }

    await next()
  } catch (error) {
    throw new ServiceError({
      message: error.message ?? 'Order creation failed',
      reason:
        error.reason ??
        `Simulation failed for Glovo Order ${glovoOrder.order_id}`,
      metric: 'orders',
      data: error.data ?? glovoOrder,
      error: error.error ?? error.response?.data,
    })
  }
}
