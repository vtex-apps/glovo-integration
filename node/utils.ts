/* eslint-disable @typescript-eslint/naming-convention */
import type {
  OrderFormItem,
  SimulationPayload,
  PayloadItem,
} from '@vtex/clients'

export const isSkuAvailable = (item: OrderFormItem | undefined): boolean => {
  if (!item) {
    return false
  }

  return item.availability === 'available'
}

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

interface CreateSimulationArgs {
  items: PayloadItem[]
  postalCode?: string
  country?: string
  affiliateId: string
  salesChannel: string
}

export const createSimulationPayload = ({
  items,
  postalCode,
  country,
  affiliateId,
  salesChannel,
}: CreateSimulationArgs): [SimulationPayload, string] => {
  const simulationPayload = {
    items,
    postalCode,
    country,
  }

  const queryString = `?affiliateId=${affiliateId}&sc=${salesChannel}`

  return [simulationPayload, queryString]
}

export const getAffilateFromStoreId = (
  storeId: string,
  affiliateConfig: AffiliateInfo[]
): AffiliateInfo | undefined =>
  affiliateConfig.find(({ glovoStoreId }) => glovoStoreId === storeId)

export const convertGlovoProductToItems = (
  glovoProducts: GlovoProduct[] = []
): PayloadItem[] => {
  const items = []
  const attributesCollection = []

  for (const product of glovoProducts) {
    const { id, quantity, attributes = [] } = product
    const item = createSimulationItem({ id, quantity })

    items.push(item)
    attributesCollection.push(...attributes)
  }

  for (const attribute of attributesCollection) {
    const { id, quantity } = attribute
    const item = createSimulationItem({ id, quantity })

    items.push(item)
  }

  return items
}

export const createVtexOrderData = (
  glovoOrder: GlovoOrder,
  orderSimulation: any
) => {
  const { name, phone_number } = glovoOrder.customer
  const { items, pickupPoints, postalCode, logisticsInfo } = orderSimulation

  let firstName = name.split(' ').slice(0, 1).join(' ')
  let lastName = name.split(' ').slice(1).join(' ')

  if (firstName === '') firstName = 'Name'
  if (lastName === '') lastName = 'Lastname'

  const logisticsInfoArray = logisticsInfo.map((item: any) => {
    return {
      itemIndex: item.itemIndex,
      selectedSla: item.slas[0].id,
      selectedDeliveryChannel: item.slas[0].deliveryChannel,
      name: item.slas[0].name,
      lockTTL: '1d',
      deliveryWindow: item.slas[0].availableDeliveryWindows[0],
      shippingEstimate: item.slas[0].shippingEstimate,
      price: item.slas[0].price,
    }
  })

  return [
    {
      marketplaceOrderId: glovoOrder.order_id,
      marketplaceServicesEndpoint: 'https://stageapi.glovoapp.com/',
      marketplacePaymentValue: glovoOrder.estimated_total_price,
      items,
      clientProfileData: {
        id: 'clientProfileData',
        email: 'customer@email.com',
        firstName,
        lastName,
        documentType: null,
        document: null,
        phone: phone_number || null,
        corporateName: null,
        tradeName: null,
        corporateDocument: null,
        stateInscription: null,
        corporatePhone: null,
        isCorporate: false,
        userProfileId: null,
      },
      shippingData: {
        id: 'shippingData',
        address: {
          addressType: 'Residential',
          receiverName: name,
          addressId: 'Home',
          postalCode,
          city: pickupPoints[0].address.city,
          state: pickupPoints[0].address.state,
          country: 'ESP',
          street: pickupPoints[0].address.street,
          number: null,
          neighborhood: null,
          complement: null,
          reference: null,
          geoCoordinates: [],
        },
        logisticsInfo: logisticsInfoArray,
      },
      paymentData: {
        id: 'paymentData',
        payments: [
          {
            paymentSystem: '0',
            paymentSystemName: 'Assumed value by affiliate Glovo - tennis',
            value: 0,
            installments: 0,
            referenceValue: 0,
          },
        ],
      },
      openTextField: null,
    },
  ]
}
