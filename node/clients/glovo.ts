import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

export default class Glovo extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('http://httpstat.us', context, options)
  }
}
