import { json } from 'co-body'

export async function affiliate(ctx: Context, next: () => Promise<any>) {
  const {
    clients: { glovo },
  } = ctx

  const body = await json(ctx.req)

  await glovo.sendBody(body)

  ctx.status = 204
  await next()
}
