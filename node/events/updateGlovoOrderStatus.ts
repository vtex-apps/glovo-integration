import { setGlovoStatus } from '../utils'

export async function updateGlovoOrderStatus(ctx: StatusChangeContext) {
  const {
    body: { orderId, currentState },
    clients: { glovo },
    state: {
      affiliateConfig: [{ affiliateId, glovoStoreId }],
    },
    vtex: { logger },
  } = ctx

  /**
   * Check if the order comes from Glovo and remove the affiliateId (i.e. 'TST') from the VTEX orderId to get the glovoOrderId.
   */
  // eslint-disable-next-line vtex/prefer-early-return
  if (orderId.startsWith(affiliateId)) {
    const glovoOrderId = orderId.split('-').slice(1).join(' ')
    const status = setGlovoStatus(currentState)

    const glovoPayload: GlovoUpdateOrderStatus = {
      glovoStoreId,
      glovoOrderId,
      status,
    }

    try {
      await glovo.updateOrderStatus(ctx, glovoPayload)

      logger.info({
        message: `Glovo order ${glovoOrderId} status updated`,
        glovoPayload,
      })
    } catch (error) {
      throw new Error(error)
    }
  }
}
