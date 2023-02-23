import { CustomError } from '../../utils'

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
      message: error.message,
      reason:
        error.reason ??
        `There was a problem getting the Glovo menu updates for the specified store`,
      status: error.statusCode ?? 500,
      payload: error,
      error: error.response?.data,
    })
  }
}
