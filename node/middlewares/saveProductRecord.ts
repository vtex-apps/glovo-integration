import { json } from 'co-body'

export async function saveProductRecord(ctx: Context) {
  const {
    clients: { recordsManager },
  } = ctx

  try {
    const {
      storeId,
      skuId,
      data,
    }: { storeId: string; skuId: string; data: ProductRecord } = await json(
      ctx.req
    )

    await recordsManager.saveProductRecord(storeId, skuId, data)

    ctx.status = 204
  } catch (error) {
    throw new Error(error)
  }
}
