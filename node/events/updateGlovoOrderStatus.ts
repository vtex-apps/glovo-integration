export async function updateGlovoOrderStatus(ctx: StatusChangeContext) {
  const {
    body: { orderId, currentState },
    clients: { glovo },
    state: {
      affiliateConfig: [{ glovoStoreId }],
    },
    vtex: { logger },
  } = ctx

  /**
   * We need to remove the affiliateId (i.e. 'TST') from the VTEX orderId to get the glovoOrderId.
   */
  const glovoOrderId = orderId.split('-').slice(1).join(' ')

  if (currentState === 'ready-for-handling' || currentState === 'invoiced') {
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
