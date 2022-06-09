import { json } from 'co-body'

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
    const appConfig = await apps.getAppSettings(
      process.env.VTEX_APP_ID as string
    )

    const { stores }: { stores: StoreInfo[] } = appConfig

    const newStores: StoreMenuUpdates[] = []

    for await (const store of stores) {
      const menuUpdatesRecord = await recordsManager.getStoreMenuUpdates(
        store.storeId
      )

      if (!menuUpdatesRecord) {
        const { storeId, glovoStoreId } = store
        const storeMenuUpdates: StoreMenuUpdates = {
          current: {
            responseId: null,
            createdAt: new Date().getTime(),
            storeId,
            glovoStoreId,
            items: [],
          },
        }

        newStores.push(storeMenuUpdates)
        await recordsManager.saveStoreMenuUpdates(storeId, storeMenuUpdates)
      }
    }

    ctx.status = 201
    ctx.body = { glovoMenu, newStores }
  } catch (error) {
    throw new Error(error)
  }
}
