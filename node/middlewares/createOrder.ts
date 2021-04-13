export async function createOrder(ctx: Context) {
  const {
    state: { orderSimulation },
  } = ctx

  ctx.body = orderSimulation
}
