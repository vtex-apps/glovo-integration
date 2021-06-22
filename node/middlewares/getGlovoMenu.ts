export async function getGlovoMenu(ctx: Context) {
  const {
    clients: { recordsManager },
  } = ctx

  try {
    const glovoMenu = await recordsManager.getGlovoMenu()

    ctx.body = glovoMenu
  } catch (error) {
    throw new Error(error)
  }
}
