import { CustomError } from '../utils'

export async function storeMenuUpdates(ctx: Context) {
  const {
    clients: { recordsManager },
    params: { affiliateId },
  } = ctx

  try {
    const storeMenuUpdatesRecord =
      await recordsManager.getStoreCompleteMenuUpdate(affiliateId)

    ctx.body = storeMenuUpdatesRecord ?? 'Store menu updates record not found'
  } catch (error) {
    throw new CustomError({
      message: `There was a problem getting the Glovo menu updates for the specified store`,
      status: 500,
      payload: error,
      error,
    })
  }
}
