import type {
  ClientsConfig,
  ServiceContext,
  RecorderState,
  ParamsContext,
  EventContext,
} from '@vtex/api'
import { LRUCache, method, Service } from '@vtex/api'

import { Clients } from './clients'
import { updateGlovoOrder } from './events/updateGlovoOrder'
import {
  affiliate,
  cancelOrder,
  createOrder,
  errorHandler,
  filterAffiliateSettings,
  validateSettings,
  validateGlovoToken,
} from './middlewares'

const TIMEOUT_MS = 800

// Create a LRU memory cache for the Status client.
// The @vtex/api HttpClient respects Cache-Control headers and uses the provided cache.
const memoryCache = new LRUCache<string, any>({ max: 5000 })

metrics.trackCache('glovo', memoryCache)

// This is the configuration for clients available in `ctx.clients`.
const clients: ClientsConfig<Clients> = {
  implementation: Clients,
  options: {
    // All IO Clients will be initialized with these options, unless otherwise specified.
    default: {
      retries: 2,
      timeout: TIMEOUT_MS,
    },
    glovo: {
      memoryCache,
    },
  },
}

declare global {
  type Context = ServiceContext<Clients, State>

  interface State extends RecorderState {
    glovoToken: string
    catalogUpdate: CatalogChange
    affiliateConfig: AffiliateInfo[]
    affiliateInfo: AffiliateInfo
  }

  interface StatusChangeContext extends EventContext<Clients> {
    body: {
      domain: string
      orderId: string
      currentState: string
      lastState: string
      currentChangeDate: string
      lastChangeDate: string
    }
  }
}

// Export a service that defines route handlers and client options.
export default new Service<Clients, State, ParamsContext>({
  clients,
  routes: {
    affiliate: method({
      POST: [
        errorHandler,
        validateSettings,
        filterAffiliateSettings,
        affiliate,
      ],
    }),
    createOrder: method({
      POST: [errorHandler, validateSettings, validateGlovoToken, createOrder],
    }),
    cancelOrder: method({
      POST: [errorHandler, validateSettings, validateGlovoToken, cancelOrder],
    }),
  },
  events: {
    orderStatus: [updateGlovoOrder],
  },
})
