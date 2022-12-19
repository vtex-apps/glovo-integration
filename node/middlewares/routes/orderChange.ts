export async function orderChange(ctx: Context) {
  const { params } = ctx

  const { orderGroupId } = params

  ctx.body = {
    orderId: orderGroupId,
    receipt: '61d49ff5-eee4-4093-aba1-1560435dedb0', // hash for transaction identification or any string that uniquely identifies the transaction!
  }
}
