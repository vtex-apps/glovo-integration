import { json } from 'co-body'

import { CustomError } from '../../utils'

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
    throw new CustomError({
      message: `There was a problem changing order ${params?.orderId}`,
      status: 500,
      payload: error,
    })
  }
}
