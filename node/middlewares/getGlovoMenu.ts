import { CustomError } from '../utils/customError'

export async function getGlovoMenu(ctx: Context) {
  const {
    clients: { recordsManager },
  } = ctx

  try {
    const glovoMenu = await recordsManager.getGlovoMenu()

    ctx.body = glovoMenu
  } catch (error) {
    if (error) throw error

    throw new CustomError({
      message: `There was a problem getting the Glovo menu`,
      status: error.status,
      payload: error,
    })
  }
}
