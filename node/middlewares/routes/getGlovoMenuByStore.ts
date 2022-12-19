import { CustomError, generateStoreMenuRecord } from '../../utils'

export async function getGlovoMenuByStore(ctx: Context) {
  const {
    clients: { recordsManager },
    params: { affiliateId },
  } = ctx

  try {
    const storeMenuRecord = await recordsManager.getStoreMenuRecord(affiliateId)

    ctx.body = storeMenuRecord ?? 'Store menu record will be generated shortly'

    generateStoreMenuRecord(ctx, affiliateId)
  } catch (error) {
    throw new CustomError({
      message: `There was a problem getting the Glovo menu for the specified store`,
      status: 500,
      payload: error,
      error,
    })
  }
}
