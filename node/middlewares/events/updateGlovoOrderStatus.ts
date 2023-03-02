import {
  getStoreInfoFromStoreId,
  ServiceError,
  setGlovoStatus,
} from '../../utils'

export async function updateGlovoOrderStatus(ctx: StatusChangeContext) {
  const {
    body,
    clients: { glovo },
    state: { glovoToken, stores },
    vtex: { logger },
  } = ctx

  const { orderId, currentState } = body
  const [orderIdAffiliate, glovoOrderId] = orderId.split('-')

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
    await glovo.updateOrderStatus(glovoPayload, glovoToken)

    logger.info({
      message: `Glovo order ${glovoPayload.glovoOrderId} status updated`,
      glovoPayload,
    })
  } catch (error) {
    throw new ServiceError({
      message: error.message,
      reason:
        error.reason ??
        `Glovo order ${glovoPayload.glovoOrderId} status update failed`,
      metric: 'orders',
      data: {
        body,
      },
      error: error.response?.data,
    })
  }
}
