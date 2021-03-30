import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

export default class Glovo extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('https://testaffiliate.free.beeceptor.com/', context, options)
  }

  public isNotActive = (body: unknown) =>
    this.http.post('/', {
      type: 'isNotActive',
      body,
    })

  public removedFromAffiliate = (body: unknown) =>
    this.http.post('/', {
      type: 'removedFromAffiliate',
      body,
    })

  public priceChanged = (body: unknown) =>
    this.http.post('/', {
      type: 'priceChanged',
      body,
    })

  public stockChanged = (body: unknown) =>
    this.http.post('/', {
      type: 'stockChanged',
      body,
    })
}
