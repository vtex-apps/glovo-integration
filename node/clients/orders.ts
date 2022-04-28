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
    data: CreateOrderPayload,
    sc: string,
    affiliateId: string
  ): Promise<VTEXOrder[]> =>
    this.http.post('/api/fulfillment/pvt/orders', [data], {
      params: {
        sc,
        affiliateId,
      },
    })

  public createMarketplaceOrder = (
    data: CreateOrderPayload,
    sc: string,
    affiliateId: string
  ): Promise<CreateMarketplaceOrderResponse> =>
    this.http.put('/api/checkout/pvt/orders', data, {
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
  ): Promise<VTEXAuthorizedOrder> =>
    this.http.post(`/api/fulfillment/pvt/orders/${orderId}/fulfill`, data, {
      params: {
        sc,
        affiliateId,
      },
    })

  public authorizeMarketplaceOrder = (
    data: AuthorizeMarketplaceOrderPayload,
    marketplaceOrderId: string
  ): Promise<VTEXAuthorizedOrder> =>
    this.http.post(
      `/api/checkout/pvt/orders/${marketplaceOrderId}/receipts/marketplace-order-authorization`,
      data
    )
}
