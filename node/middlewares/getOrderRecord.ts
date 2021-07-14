export async function getOrderRecord(ctx: Context) {
  const {
    clients: { recordsManager },
    query: { orderId },
  } = ctx

  try {
    const orderRecord = await recordsManager.getOrderRecord(orderId)

    ctx.body = orderRecord
  } catch (error) {
    throw new Error(error)
  }
}
