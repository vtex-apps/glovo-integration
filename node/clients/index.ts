import { IOClients } from '@vtex/api'
import { Checkout } from '@vtex/clients'

import Glovo from './glovo'
import Orders from './orders'

// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {
  public get glovo() {
    return this.getOrSet('glovo', Glovo)
  }

  public get orders() {
    return this.getOrSet('orders', Orders)
  }

  public get checkout() {
    return this.getOrSet('checkout', Checkout)
  }
}
