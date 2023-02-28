import type { ParamsContext } from '@vtex/api'
import { Service } from '@vtex/api'

import type { Clients } from './clients'
import { clientsConfig } from './clients'
import { events } from './middlewares/events'
import { routes } from './middlewares/routes'
import { resolvers } from './resolvers'

// Export a service that defines route handlers and client options.
export default new Service<Clients, State, ParamsContext>({
  clients: clientsConfig,
  routes,
  events,
  graphql: {
    resolvers,
  },
})
