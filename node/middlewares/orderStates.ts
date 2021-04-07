export async function orderStates(
  ctx: StatusChangeContext,
  next: () => Promise<any>
) {
  console.log(ctx.body)
  await next()
}