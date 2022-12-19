import { json } from 'co-body'

import { APP_SETTINGS, GLOVO } from '../../constants'
import { CustomError } from '../../utils'

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
    const appSettings: AppSettings = await vbase.getJSON(
      GLOVO,
      APP_SETTINGS,
      true
    )

    const { stores }: { stores: StoreInfo[] } = appSettings

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

    ctx.status = 201
    ctx.body = { glovoMenu, newStores }
  } catch (error) {
    throw new CustomError({
      message: `There was a problem saving the Glovo menu`,
      status: 500,
      error,
    })
  }
}
