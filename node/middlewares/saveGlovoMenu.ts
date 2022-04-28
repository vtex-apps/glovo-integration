import { json } from 'co-body'

import { CustomError } from '../utils/customError'

export async function saveGlovoMenu(ctx: Context) {
  const {
    clients: { apps, recordsManager },
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
    const appSettings = await apps.getAppSettings(
      process.env.VTEX_APP_ID as string
    )

    const { stores }: { stores: StoreInfo[] } = appSettings

    const newStores: StoreMenuUpdates[] = []

    for await (const store of stores) {
      const menuUpdatesRecord = await recordsManager.getStoreMenuUpdates(
        store.id
      )

      if (!menuUpdatesRecord) {
        const { id, glovoStoreId } = store
        const storeMenuUpdates: StoreMenuUpdates = {
          current: {
            responseId: null,
            createdAt: new Date().getTime(),
            storeId: id,
            glovoStoreId,
            items: [],
          },
        }

        newStores.push(storeMenuUpdates)
        await recordsManager.saveStoreMenuUpdates(id, storeMenuUpdates)
      }
    }

    ctx.status = 201
    ctx.body = { glovoMenu, newStores }
  } catch (error) {
    if (error) throw error

    throw new CustomError({
      message: `There was a problem saving the Glovo menu`,
      status: error.status,
      payload: error,
    })
  }
}
