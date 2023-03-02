import type { EventContext, RecorderState, ServiceContext } from '@vtex/api'
import type { Clients } from '../clients'

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
