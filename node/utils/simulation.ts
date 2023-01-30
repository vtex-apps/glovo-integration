import type {
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
  items: string[],
  quantity: number,
  sellerId: string
): PayloadItem[] => {
  const simulationItems: PayloadItem[] = []

  for (const item of items) {
    const payloadItem: PayloadItem = {
      id: item,
      quantity,
      seller: sellerId,
    }

    simulationItems.push(payloadItem)
  }

  return simulationItems
}

export const MAX_ITEMS_FOR_SIMULATION = 300

export function iterationLimits(step: number) {
  return [
    MAX_ITEMS_FOR_SIMULATION * step,
    MAX_ITEMS_FOR_SIMULATION * step + MAX_ITEMS_FOR_SIMULATION - 1,
  ]
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
  items: OrderFormItem[],
  minimumStock: number
): GlovoBulkUpdateProduct => {
  const payload: GlovoBulkUpdateProduct = {
    products: [],
  }

  for (const item of items) {
    const { id, price, listPrice, unitMultiplier, availability, quantity } =
      item

    const available = availability === AVAILABLE && quantity >= minimumStock

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
  ctx: Context
): Promise<SimulatedItem | null> => {
  const {
    clients: { checkout },
    vtex: { logger },
  } = ctx

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
    logger.warn({
      message:
        error.message ?? `Simulation for product with skuId ${IdSku} failed`,
      data: error.response,
    })

    return null
  }
}
