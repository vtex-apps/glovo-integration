import type {
  Checkout,
  OrderFormItem,
  PayloadItem,
  SimulationPayload,
} from '@vtex/clients'

import { AVAILABLE } from '../constants'
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

export const createSimulationItems = (
  glovoMenu: GlovoMenu,
  sellerId: string
): PayloadItem[] => {
  const simulationItems: PayloadItem[] = []

  for (const key in glovoMenu) {
    if (glovoMenu[key]) {
      const item: PayloadItem = {
        id: key,
        quantity: 1,
        seller: sellerId,
      }

      simulationItems.push(item)
    }
  }

  return simulationItems
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

export const createGlovoBulkUpdatePayload = (
  items: OrderFormItem[]
): GlovoBulkUpdateProduct => {
  const payload: GlovoBulkUpdateProduct = {
    products: [],
  }

  for (const item of items) {
    const { id, price, listPrice, unitMultiplier, availability } = item
    const available = availability === AVAILABLE

    const payloadProduct: GlovoPatchProduct = {
      id,
      available,
    }

    if (available) {
      payloadProduct.price = (Math.max(price, listPrice) * unitMultiplier) / 100
    }

    payload.products.push(payloadProduct)
  }

  return payload
}

export const simulateItem = async (
  IdSku: string,
  store: StoreInfo,
  checkout: Checkout
): Promise<SimulatedItem | null> => {
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

  try {
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
  } catch (error) {
    return null
  }
}
