import {
  CustomError,
  getStoreInfoFromStoreId,
  isValidAffiliateId,
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
  const [orderIdAffiliate, glovoOrderId] = orderId.split('-')

  if (!isValidAffiliateId(orderIdAffiliate, stores)) {
    logger.warn({
      message: 'Glovo order status not modified',
      reason: 'AffiliateId not valid',
      data: body,
    })

    return
  }

  const storeInfo = getStoreInfoFromStoreId(orderIdAffiliate, stores)

  const { glovoStoreId } = storeInfo
  const status = setGlovoStatus(currentState)

  if (!status) {
    logger.warn({
      message: `The status is required for order modification for order ${orderId}`,
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
    throw new CustomError({
      message: `Glovo order ${glovoPayload.glovoOrderId} status update failed`,
      status: 500,
      payload: error,
      error,
    })
  }
}
