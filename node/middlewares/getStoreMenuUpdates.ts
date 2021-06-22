export async function getStoreMenuUpdates(ctx: Context) {
  const {
    clients: { recordsManager },
    query: { storeId },
  } = ctx

  try {
    const storeMenuUpdates = await recordsManager.getStoreMenuUpdates(storeId)

    ctx.body = storeMenuUpdates
  } catch (error) {
    throw new Error(error)
  }
}
