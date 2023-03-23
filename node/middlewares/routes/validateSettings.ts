import { AuthenticationError, UserInputError } from '@vtex/api'
import { json } from 'co-body'
import type { GlovoIntegrationSettings } from 'vtex.glovo-integration'

import { APP_SETTINGS, GLOVO } from '../../constants'
import { getStoreInfoFormGlovoStoreId } from '../../utils'

export async function validateSettings(
  ctx: Context,
  next: () => Promise<void>
) {
  const {
    clients: { vbase },
    req: { headers },
    vtex: { logger },
  } = ctx

  const appSettings: GlovoIntegrationSettings = await vbase.getJSON(
    GLOVO,
    APP_SETTINGS,
    true
  )

  if (!appSettings.glovoToken) {
    throw new UserInputError('Missing Glovo token. Please check app settings')
  }

  const reqAuth = headers.authorization

  if (!reqAuth || reqAuth !== appSettings.glovoToken) {
    throw new AuthenticationError('Invalid Glovo token')
  }

  const glovoOrder: GlovoOrder = await json(ctx.req)

  logger.info({
    message: `Received order ${glovoOrder.order_id} from store ${glovoOrder.store_id} from Glovo`,
    glovoOrder,
  })

  const storeInfo = getStoreInfoFormGlovoStoreId(
    glovoOrder.store_id,
    appSettings.stores
  )

  if (!storeInfo) {
    throw new Error('Store information not found. Check integration settings.')
  }

  ctx.state.clientProfileData = appSettings.clientProfileData
  ctx.state.glovoOrder = glovoOrder
  ctx.state.marketplace = appSettings.marketplace
  ctx.state.storeInfo = storeInfo

  await next()
}
