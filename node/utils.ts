import type { OrderFormItem, SimulationPayload } from '@vtex/clients'

export const isSkuAvailable = (item: OrderFormItem | undefined): boolean => {
  if (!item) {
    return false
  }

  return item.availability === 'available'
}

interface CreateSimulationArgs {
  skuId: string
  affiliateId: string
  salesChannel: string
}

export const createSimulationPayload = ({
  skuId,
  affiliateId,
  salesChannel,
}: CreateSimulationArgs): [SimulationPayload, string] => {
  const simulationPayload = {
    items: [
      {
        id: skuId,
        quantity: 1,
        seller: '1',
      },
    ],
  }

  const queryString = `?affiliateId=${affiliateId}&sc=${salesChannel}`

  return [simulationPayload, queryString]
}
