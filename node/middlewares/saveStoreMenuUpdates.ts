import { json } from 'co-body'

export async function saveStoreMenuUpdates(ctx: Context) {
  const {
    clients: { recordsManager },
  } = ctx

  try {
    const {
      storeId,
      glovoStoreId,
      items,
    }: {
      storeId: string
      glovoStoreId: string
      items: ProductRecord[]
    } = await json(ctx.req)

    const storeMenuUpdates: MenuUpdatesItem[] = [
      {
        responseId: null,
        createdAt: new Date().getTime(),
        storeId,
        glovoStoreId,
        items,
      },
    ]

    await recordsManager.saveStoreMenuUpdates(storeId, storeMenuUpdates)

    ctx.status = 204
  } catch (error) {
    throw new Error(error)
  }
}
