import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

export default class Glovo extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('https://testaffiliate.free.beeceptor.com/', context, options)
  }

  public api = (body: unknown) => this.http.post('/', body)
}
