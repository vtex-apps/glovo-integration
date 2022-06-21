import {
  CustomError,
  getStoreInfoFromAffiliateId,
  setGlovoStatus,
} from '../utils'

export async function updateGlovoOrderStatus(ctx: StatusChangeContext) {
  const {
    body,
    clients: { glovo },
    state: { stores },
    vtex: { logger },
  } = ctx

  /**
   * Check if the order comes from Glovo and remove the affiliateId (i.e. 'TST') from the VTEX orderId to get the glovoOrderId.
   */
  const { orderId, currentState } = body
  const storeId = orderId.slice(0, 3)
  const storeInfo = getStoreInfoFromAffiliateId(storeId, stores)

  if (!storeInfo) {
    throw new Error(
      `Store information not found for order modification for order ${orderId}`
    )
  }

  const glovoOrderId = orderId.split('-').slice(1).join(' ')
  const { glovoStoreId } = storeInfo
  const status = setGlovoStatus(currentState)

  if (!status) {
    throw new Error(
      `The status is required for order modification for order ${orderId}`
    )
  }

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
    throw new CustomError({
      message: `Glovo order ${glovoPayload.glovoOrderId} status update failed`,
      status: 500,
      payload: error,
    })
  }
}
