import { getAffiliateFromAffiliateId, setGlovoStatus } from '../utils'

export async function updateGlovoOrderStatus(ctx: StatusChangeContext) {
  const {
    body: { orderId, currentState },
    clients: { glovo },
    state: { affiliateConfig },
    vtex: { logger },
  } = ctx

  /**
   * Check if the order comes from Glovo and remove the affiliateId (i.e. 'TST') from the VTEX orderId to get the glovoOrderId.
   */
  const orderAffiliate = orderId.slice(0, 3)
  const affiliate = getAffiliateFromAffiliateId(orderAffiliate, affiliateConfig)

  if (!affiliate) {
    return
  }

  const glovoOrderId = orderId.split('-').slice(1).join(' ')
  const { glovoStoreId } = affiliate
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
