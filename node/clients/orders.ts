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

  public getOrder(orderId: string): Promise<VTEXOrder> {
    return this.http.get(`/api/oms/pvt/orders/${orderId}`)
  }

  public createOrder(
    data: CreateOrderPayload,
    sc: string,
    affiliateId: string
  ): Promise<VTEXOrder[]> {
    return this.http.post('/api/fulfillment/pvt/orders', [data], {
      params: {
        sc,
        affiliateId,
      },
    })
  }

  public createMarketplaceOrder(
    data: CreateOrderPayload,
    sc: string,
    affiliateId: string
  ): Promise<CreateMarketplaceOrderResponse> {
    return this.http.put('/api/checkout/pvt/orders', data, {
      params: {
        sc,
        affiliateId,
      },
    })
  }

  // eslint-disable-next-line max-params
  public authorizeOrder(
    data: AuthorizeOrderPayload,
    orderId: string,
    sc: string,
    affiliateId: string
  ): Promise<VTEXAuthorizedOrder> {
    return this.http.post(
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

  public authorizeMarketplaceOrder(
    data: AuthorizeMarketplaceOrderPayload,
    marketplaceOrderId: string
  ): Promise<VTEXAuthorizedOrder> {
    return this.http.post(
      `/api/checkout/pvt/orders/${marketplaceOrderId}/receipts/marketplace-order-authorization`,
      data
    )
  }
}
