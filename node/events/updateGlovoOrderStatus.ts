import { setGlovoStatus } from '../utils'

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
  const affiliates = affiliateConfig.map(
    ({
      affiliateId,
      glovoStoreId,
    }: {
      affiliateId: string
      glovoStoreId: string
    }) => ({ affiliateId, glovoStoreId })
  )

  let glovoPayload: GlovoUpdateOrderStatus = {
    glovoStoreId: '',
    glovoOrderId: '',
    status: '',
  }

  for (const affiliate of affiliates) {
    if (affiliate.affiliateId === orderAffiliate) {
      const glovoOrderId = orderId.split('-').slice(1).join(' ')
      const status = setGlovoStatus(currentState)
      const { glovoStoreId } = affiliate

      glovoPayload = {
        glovoStoreId,
        glovoOrderId,
        status,
      }

      break
    }
  }

  if (glovoPayload.glovoOrderId !== '') {
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
}
