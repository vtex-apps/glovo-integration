import type { Checkout, PayloadItem, SimulationPayload } from '@vtex/clients'

import { isSkuAvailable } from './utils'

export const createSimulationItem = ({
  id,
  quantity,
}: {
  id: string
  quantity: number
}): PayloadItem => {
  return {
    id,
    quantity,
    seller: '1',
  }
}

export const createSimulationPayload = ({
  items,
  postalCode,
  country,
  storeId,
  salesChannel,
}: CreateSimulationArgs): [SimulationPayload, string] => {
  const simulationPayload = {
    items,
    postalCode,
    country,
  }

  const queryString = `?storeId=${storeId}&sc=${salesChannel}`

  return [simulationPayload, queryString]
}

export const simulateItem = async (
  IdSku: string,
  store: StoreInfo,
  checkout: Checkout
): Promise<{ price: number; available: boolean }> => {
  const { storeId, salesChannel, postalCode, country } = store
  const simulationItem = createSimulationItem({ id: IdSku, quantity: 1 })
  const simulationPayload = createSimulationPayload({
    items: [simulationItem],
    storeId,
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
