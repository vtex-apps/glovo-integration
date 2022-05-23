import { getStoreInfoFromStoreId, setGlovoStatus } from '../utils'
import { CustomError } from '../utils/customError'

export async function updateGlovoOrderStatus(ctx: StatusChangeContext) {
  const {
    body,
    clients: { glovo },
    state: { stores },
    vtex: { logger },
  } = ctx

  logger.info({
    message: 'Received Order Status change event',
    data: body,
  })

  /**
   * Check if the order comes from Glovo and remove the affiliateId (i.e. 'TST') from the VTEX orderId to get the glovoOrderId.
   */
  const { orderId, currentState } = body
  const storeId = orderId.slice(0, 3)
  const storeInfo = getStoreInfoFromStoreId(storeId, stores)

  if (!storeInfo) {
    throw new CustomError({
      message: `Store information not found for order modification for order ${orderId}`,
      status: 500,
      payload: body,
    })
  }

  const glovoOrderId = orderId.split('-').slice(1).join(' ')
  const { glovoStoreId } = storeInfo
  const status = setGlovoStatus(currentState)

  if (!status) {
    throw new CustomError({
      message: `The status is required for order modification for order ${orderId}`,
      status: 500,
      payload: body,
    })
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
