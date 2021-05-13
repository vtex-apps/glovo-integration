export async function sendResponse(ctx: Context) {
  return (ctx.status = 204)
}
