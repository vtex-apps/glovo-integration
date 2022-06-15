import { CustomError } from '../utils/customError'

export async function getGlovoMenuByStore(ctx: Context) {
  const {
    clients: { recordsManager },
  } = ctx

  try {
    const glovoMenu = await recordsManager.getGlovoMenu()
    const { storeId } = ctx.params
    let itemRecord = []
    for (const key in glovoMenu) {
      if (glovoMenu[key]) {
        const item = recordsManager.getProductRecord(storeId, key)
        itemRecord.push(item)
      }
    }
    itemRecord = await Promise.all(itemRecord)

    ctx.body = itemRecord
  } catch (error) {
    throw new CustomError({
      message: `There was a problem getting the Glovo menu for the specified store`,
      status: 500,
      payload: error,
      error,
    })
  }
}
