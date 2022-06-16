import { CustomError } from '.'

export const generateStoreMenuRecord = async (
  ctx: Context,
  affiliateId: string
) => {
  const {
    clients: { recordsManager },
  } = ctx

  try {
    const glovoMenu = await recordsManager.getGlovoMenu()

    if (!glovoMenu) {
      throw new Error('Unable to get Glovo Menu')
    }

    const storeMenuRecord: StoreMenuRecord = {
      items: {},
      lastUpdated: '',
    }

    const itemIds = Object.keys(glovoMenu)

    for await (const item of itemIds) {
      const recordItem = await recordsManager.getProductRecord(
        affiliateId,
        item
      )

      if (recordItem) {
        storeMenuRecord.items[item] = recordItem
      }
    }

    storeMenuRecord.lastUpdated = Date()

    recordsManager.saveStoreMenuRecord(affiliateId, storeMenuRecord)
  } catch (error) {
    throw new CustomError({
      message: `There was a problem creating the store menu record for ${affiliateId}`,
      status: 500,
      error,
    })
  }
}
