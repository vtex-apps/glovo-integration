import { ServiceError } from '../../utils'

export async function getGlovoMenu(ctx: Context) {
  const {
    clients: { recordsManager },
  } = ctx

  try {
    const glovoMenu = await recordsManager.getGlovoMenu()

    ctx.body = glovoMenu
  } catch (error) {
    throw new ServiceError({
      message: error.message,
      reason: `There was a problem getting the Glovo menu`,
      metric: 'menu',
      error: error.response?.data,
    })
  }
}
