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

  public getOrder = (orderId: string) =>
    this.http.get(`/api/oms/pvt/orders/${orderId}`)

  public createOrder = (
    data: MarketplaceOrder,
    sc: string,
    affiliateId: string
  ) =>
    this.http.post<VTEXOrder[]>(`/api/fulfillment/pvt/orders`, [data], {
      params: {
        sc,
        affiliateId,
      },
    })

  public authorizeOrder = (
    data: AuthorizeOrderPayload,
    orderId: string,
    sc: string,
    affiliateId: string
    // eslint-disable-next-line max-params
  ) =>
    this.http.post<VTEXAuthorizedOrder>(
      `/api/fulfillment/pvt/orders/${orderId}/fulfill`,
      data,
      {
        params: {
          sc,
          affiliateId,
        },
      }
    )
}
