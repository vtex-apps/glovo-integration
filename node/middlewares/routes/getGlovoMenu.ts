import { CustomError } from '../../utils'

export async function getGlovoMenu(ctx: Context) {
  const {
    clients: { recordsManager },
  } = ctx

  try {
    const glovoMenu = await recordsManager.getGlovoMenu()

    ctx.body = glovoMenu
  } catch (error) {
    throw new CustomError({
      message: error.message,
      reason: `There was a problem getting the Glovo menu`,
      status: error.statusCode ?? 500,
      payload: error,
      error: error.response?.data,
    })
  }
}
