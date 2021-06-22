import { json } from 'co-body'

export async function saveGlovoMenu(ctx: Context) {
  const {
    clients: { recordsManager },
  } = ctx

  try {
    const glovoMenuItems: number[] | string[] = await json(ctx.req)
    const glovoMenu: GlovoMenu = {}

    for (const skuId of glovoMenuItems) {
      glovoMenu[skuId] = true
    }

    await recordsManager.saveGlovoMenu(glovoMenu)

    ctx.status = 204
  } catch (error) {
    throw new Error(error)
  }
}
