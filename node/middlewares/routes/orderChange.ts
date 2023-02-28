import { json } from 'co-body'

import { ServiceError } from '../../utils'

export async function orderChange(ctx: Context) {
  const {
    vtex: {
      route: { params },
    },
  } = ctx

  try {
    const { orderId } = params
    const body: OrderChangeBody = await json(ctx.req)

    ctx.body = {
      orderId,
      receipt: body.requestId,
    }
  } catch (error) {
    throw new ServiceError({
      message: error.message,
      reason:
        error.reason ?? `There was a problem changing order ${params?.orderId}`,
      metric: 'orders',
      data: ctx.body,
      error: error.response?.data,
    })
  }
}
