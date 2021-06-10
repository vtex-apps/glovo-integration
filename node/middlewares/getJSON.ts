export async function getJSON(ctx: Context) {
  const {
    clients: { vbase },
    query: { bucket, path },
  } = ctx

  try {
    const json = await vbase.getJSON(bucket, path)

    ctx.body = json
  } catch (error) {
    throw new Error(error)
  }
}
