import { json } from 'co-body'

export async function createOrder(ctx: Context) {
  const glovoOrder: GlovoOrder = await json(ctx.req)

  ctx.body = glovoOrder
}
