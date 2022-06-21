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
    return
  }

  const glovoOrderId = orderId.split('-').slice(1).join(' ')
  const { glovoStoreId } = storeInfo
  const status = setGlovoStatus(currentState)

  if (!status) {
    logger.warn({
      message: 'The status is required',
      data: body,
    })

    return
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
    if (error) throw error

    throw new CustomError({
      message: `Glovo order ${glovoPayload.glovoOrderId} status update failed`,
      status: error.status,
      payload: error,
    })
  }
}
