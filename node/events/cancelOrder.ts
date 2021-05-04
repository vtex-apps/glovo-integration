import { json } from 'co-body'

export async function cancelOrder(ctx: Context) {
  const glovoCancellation: GlovoOrderCancellation = await json(ctx.req)

  ctx.body = glovoCancellation
}
