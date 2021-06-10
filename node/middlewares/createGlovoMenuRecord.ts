import menu from '../glovoMenu'

export async function createGlovoMenuRecord(
  ctx: Context,
  next: () => Promise<void>
) {
  const {
    state: { affiliateConfig },
    clients: { vbase },
  } = ctx

  await next()

  try {
    await vbase.saveJSON('Glovo', 'Menu', menu)

    const glovoMenu: GlovoMenu = await vbase.getJSON('Glovo', 'Menu', true)

    for (const store of affiliateConfig) {
      for (const sku in glovoMenu) {
        vbase.saveJSON(store.affiliateId, sku, {
          id: sku,
          price: 0,
          available: false,
        })
      }
    }

    ctx.status = 201
    ctx.body = glovoMenu
  } catch (error) {
    throw new Error('Something went wrong')
  }
}
