import type { InstanceOptions, IOContext } from '@vtex/api'
import { JanusClient } from '@vtex/api'

export default class Orders extends JanusClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(context, {
      ...options,
      headers: {
        ...options?.headers,
        VtexIdclientAutCookie: context.authToken,
      },
    })
  }

  public createOrder = (body: unknown, sc: string, affiliateId: string) =>
    this.http.post(`/api/fulfillment/pvt/orders`, body, {
      params: {
        sc,
        affiliateId,
      },
    })

  public authorizeOrder = (
    body: unknown,
    orderId: string,
    sc: string,
    affiliateId: string
    // eslint-disable-next-line max-params
  ) =>
    this.http.post(`/api/fulfillment/pvt/orders/${orderId}/fulfill`, body, {
      params: {
        sc,
        affiliateId,
      },
    })
}
