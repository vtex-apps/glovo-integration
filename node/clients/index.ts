import type { ClientsConfig } from '@vtex/api'
import { IOClients, LRUCache } from '@vtex/api'
import { Checkout } from '@vtex/clients'

import { TIMEOUT_MS } from '../constants'
import Glovo from './glovo'
import Orders from './orders'
import RecordsManager from './recordManager'

// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {
  public get glovo() {
    return this.getOrSet('glovo', Glovo)
  }

  public get orders() {
    return this.getOrSet('orders', Orders)
  }

  public get recordsManager() {
    return this.getOrSet('recordsManager', RecordsManager)
  }

  public get checkout() {
    return this.getOrSet('checkout', Checkout)
  }
}

// Create a LRU memory cache for the Status client.
// The @vtex/api HttpClient respects Cache-Control headers and uses the provided cache.
const memoryCache = new LRUCache<string, any>({ max: 5000 })

metrics.trackCache('glovo', memoryCache)

// This is the configuration for clients available in `ctx.clients`.
export const clientsConfig: ClientsConfig<Clients> = {
  implementation: Clients,
  options: {
    default: {
      retries: 2,
      timeout: TIMEOUT_MS,
    },
    glovo: {
      memoryCache,
    },
  },
}
