import type { Checkout, PayloadItem, SimulationPayload } from '@vtex/clients'

import { isSkuAvailable } from './utils'

export const createSimulationItem = ({
  id,
  quantity,
  sellerId,
}: SimulationItem): PayloadItem => {
  return {
    id,
    quantity,
    seller: sellerId,
  }
}

export const createSimulationPayload = ({
  items,
  affiliateId,
  salesChannel,
  postalCode,
  country,
}: CreateSimulationArgs): [SimulationPayload, string] => {
  const simulationPayload = {
    items,
    postalCode,
    country,
  }

  const queryString = `?affiliateId=${affiliateId}&sc=${salesChannel}`

  return [simulationPayload, queryString]
}

export const simulateItem = async (
  IdSku: string,
  store: StoreInfo,
  checkout: Checkout
): Promise<SimulatedItem> => {
  const { affiliateId, sellerId, salesChannel, postalCode, country } = store
  const simulationItem = createSimulationItem({
    id: IdSku,
    quantity: 1,
    sellerId,
  })

  const simulationPayload = createSimulationPayload({
    items: [simulationItem],
    affiliateId,
    salesChannel,
    postalCode,
    country,
  })

  const simulation = await checkout.simulation(...simulationPayload)

  const {
    items: [item],
  } = simulation

  let itemInfo = {
    price: 0,
    available: false,
  }

  if (isSkuAvailable(item)) {
    const { price, listPrice, unitMultiplier } = item

    itemInfo = {
      price: (Math.max(price, listPrice) * unitMultiplier) / 100,
      available: true,
    }
  }

  return itemInfo
}
