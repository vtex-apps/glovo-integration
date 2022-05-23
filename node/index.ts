import type {
  ClientsConfig,
  ServiceContext,
  RecorderState,
  ParamsContext,
  EventContext,
} from '@vtex/api'
import { LRUCache, method, Service } from '@vtex/api'
import type { SimulationOrderForm } from '@vtex/clients'

import { Clients } from './clients'
import {
  cancelOrder,
  compareOrder,
  eventsErrorHandler,
  updateGlovoOrderStatus,
  validateEventSettings,
} from './events'
import {
  authorizeOrder,
  createOrder,
  errorHandler,
  getGlovoMenu,
  glovoMenuUpdateAll,
  glovoMenuUpdatePartial,
  glovoProductUpdate,
  saveGlovoMenu,
  saveOrderRecord,
  sendResponse,
  simulateOrder,
  validateSettings,
  validateGlovoToken,
} from './middlewares'
import { mutations, queries } from './resolvers'

const TIMEOUT_MS = 5000

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
    vtexAuthOrder: VTEXAuthorizedOrder
    vtexOrder: VTEXOrder | VTEXMarketplaceOrder
    glovoOrder: GlovoOrder
    glovoToken: string
    catalogUpdate: CatalogChange
    marketplace: boolean
    stores: StoreInfo[]
    storeInfo: StoreInfo
    clientProfileData: ClientProfileData
    orderSimulation: SimulationOrderForm
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
    createOrder: method({
      POST: [
        errorHandler,
        validateSettings,
        validateGlovoToken,
        simulateOrder,
        createOrder,
        authorizeOrder,
        saveOrderRecord,
      ],
    }),
    cancelOrder: method({
      POST: [errorHandler, validateSettings, validateGlovoToken, cancelOrder],
    }),
    updateProduct: method({
      POST: [glovoProductUpdate, sendResponse],
    }),
    updateMenuAll: method({
      POST: [glovoMenuUpdateAll, sendResponse],
    }),
    updateMenuPartial: method({
      POST: [glovoMenuUpdatePartial, sendResponse],
    }),
    glovoMenu: method({
      GET: [errorHandler, getGlovoMenu],
      POST: [errorHandler, saveGlovoMenu],
    }),
  },
  events: {
    updateOnStartHandling: [
      eventsErrorHandler,
      validateEventSettings,
      compareOrder,
      updateGlovoOrderStatus,
    ],
    updateOnInvoiced: [
      eventsErrorHandler,
      validateEventSettings,
      compareOrder,
      updateGlovoOrderStatus,
    ],
  },
  graphql: {
    resolvers: {
      Query: {
        ...queries,
      },
      Mutation: {
        ...mutations,
      },
    },
  },
})
