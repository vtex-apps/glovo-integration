import { getStoreInfoFromStoreId, setGlovoStatus } from '../utils'

export async function updateGlovoOrderStatus(ctx: StatusChangeContext) {
  const {
    body: { orderId, currentState },
    clients: { glovo },
    state: { storesConfig },
    vtex: { logger },
  } = ctx

  /**
   * Check if the order comes from Glovo and remove the storeId (i.e. 'TST') from the VTEX orderId to get the glovoOrderId.
   */
  const storeId = orderId.slice(0, 3)
  const storeInfo = getStoreInfoFromStoreId(storeId, storesConfig)

  if (!storeInfo) {
    return
  }

  const glovoOrderId = orderId.split('-').slice(1).join(' ')
  const { glovoStoreId } = storeInfo
  const status = setGlovoStatus(currentState)

  const glovoPayload: GlovoUpdateOrderStatus = {
    glovoStoreId,
    glovoOrderId,
    status,
  }

  try {
    await glovo.updateOrderStatus(ctx, glovoPayload)

    logger.info({
      message: `Glovo order ${glovoPayload.glovoOrderId} status updated`,
      glovoPayload,
    })
  } catch (error) {
    throw new Error(error)
  }
}
