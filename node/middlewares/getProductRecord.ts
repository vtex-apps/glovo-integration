export async function getProductRecord(ctx: Context) {
  const {
    clients: { recordsManager },
    query: { storeId, skuId },
  } = ctx

  try {
    const productRecord = await recordsManager.getProductRecord(storeId, skuId)

    ctx.body = productRecord
  } catch (error) {
    throw new Error(error)
  }
}
