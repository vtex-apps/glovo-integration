import { json } from 'co-body'

export async function saveJSON(ctx: Context) {
  const { bucket, path, data } = await json(ctx.req)
  const {
    clients: { vbase },
  } = ctx

  try {
    const savedJson = await vbase.saveJSON(bucket, path, data)

    ctx.body = savedJson
  } catch (error) {
    throw new Error(error)
  }
}
