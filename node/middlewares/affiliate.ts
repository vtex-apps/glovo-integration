import { json } from 'co-body'

export async function affiliate(ctx: Context, next: () => Promise<any>) {
  const {
    clients: { glovo },
    vtex: { logger },
  } = ctx

  const body = await json(ctx.req)

  try {
    await glovo.sendBody(body)
    logger.info(body)
  } catch (error) {
    throw new TypeError(error)
  }

  ctx.status = 204
  await next()
}
