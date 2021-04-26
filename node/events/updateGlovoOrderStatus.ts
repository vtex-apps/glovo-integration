import { START_HANDLING, INVOICED } from '../constants'

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
  if (orderId.startsWith(affiliateId)) {
    const glovoOrderId = orderId.split('-').slice(1).join(' ')

    if (currentState === START_HANDLING || currentState === INVOICED) {
      const glovoPayload = {
        glovoStoreId,
        glovoOrderId,
        currentState,
      }

      try {
        await glovo.updateOrderStatus(ctx, glovoPayload)

        logger.info({ message: 'Glovo order status updated', glovoPayload })
      } catch (error) {
        logger.error({
          message: 'Unable to update Glovo order status',
          status: error.response.status,
        })
        throw new Error(
          `Unable to update Glovo Order Status. Received ${error.response.status}`
        )
      }
    }
  }
}
