import { json } from 'co-body'
import type { GlovoIntegrationSettings, Store } from 'vtex.glovo-integration'

import { APP_SETTINGS, GLOVO } from '../../constants'
import { ServiceError } from '../../utils'

export async function saveGlovoMenu(ctx: Context) {
  const {
    clients: { vbase, recordsManager },
  } = ctx

  try {
    // Create/update Glovo Menu record
    const glovoMenuItems: number[] | string[] = await json(ctx.req)
    const glovoMenu: GlovoMenu = {}

    for (const skuId of glovoMenuItems) {
      glovoMenu[skuId] = true
    }

    await recordsManager.saveGlovoMenu(glovoMenu)

    // Create initial Store Menu Updates record
    const appSettings: GlovoIntegrationSettings = await vbase.getJSON(
      GLOVO,
      APP_SETTINGS,
      true
    )

    const { stores }: { stores: Store[] } = appSettings

    const newStores: StoreMenuUpdates[] = []

    for await (const store of stores) {
      const menuUpdatesRecord = await recordsManager.getStoreMenuUpdates(
        store.glovoStoreId
      )

      if (!menuUpdatesRecord) {
        const { id, storeName, glovoStoreId } = store
        const storeMenuUpdates: StoreMenuUpdates = {
          current: {
            responseId: null,
            createdAt: new Date().getTime(),
            storeId: id,
            storeName,
            glovoStoreId,
            items: [],
          },
        }

        newStores.push(storeMenuUpdates)
        await recordsManager.saveStoreMenuUpdates(
          glovoStoreId,
          storeMenuUpdates
        )
      }
    }

    ctx.status = 200
    ctx.body = { glovoMenu, newStores }
  } catch (error) {
    throw new ServiceError({
      message: error.message,
      reason: `There was a problem saving the Glovo menu`,
      metric: 'menu',
      data: ctx.req,
      error: error.response?.data,
    })
  }
}
