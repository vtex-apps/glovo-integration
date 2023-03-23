import type { EventContext, RecorderState, ServiceContext } from '@vtex/api'
import type { ClientProfileData, Store } from 'vtex.glovo-integration'
import type { Clients } from '../clients'

declare global {
  type Context = ServiceContext<Clients, State>

  interface State extends RecorderState {
    vtexOrder: VTEXOrder | VTEXMarketplaceOrder
    glovoOrder: GlovoOrder
    glovoToken: string
    marketplace: boolean
    stores: Store[]
    storeInfo: Store
    clientProfileData: ClientProfileData
    orderSimulation: SimulationOrderForm
  }

  interface StatusChangeContext extends EventContext<Clients, State> {
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
