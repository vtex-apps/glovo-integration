import { RESIDENTIAL, HOME } from '../constants'
import { isSkuAvailable } from './utils'

/* eslint-disable @typescript-eslint/naming-convention */
export const createVtexOrderData = (
  glovoOrder: GlovoOrder,
  orderSimulation: any,
  clientProfileData: ClientProfileData
): CreateOrderPayload => {
  const { order_id, estimated_total_price } = glovoOrder
  const { items, pickupPoints, postalCode, logisticsInfo } = orderSimulation
  const {
    email,
    firstName,
    lastName,
    documentType,
    document,
    phone,
    corporateName,
  } = clientProfileData

  /** Re-Index items array */
  let counter = 0
  const updatedItems = items.reduce((reIndexedItems: any, item: any) => {
    if (isSkuAvailable(item)) {
      const updatedItem = {
        ...item,
        itemIndex: 0,
      }

      counter++

      return [...reIndexedItems, updatedItem]
    }

    return reIndexedItems
  }, [])

  /** Re-Index logisticsInfo array */
  counter = 0
  const updatedLogisticsInfo = logisticsInfo.reduce(
    (reIndexedItems: any[], item: any, index: number) => {
      if (items[index].availability === 'available') {
        const updatedItem = {
          itemIndex: counter,
          selectedSla: item.slas[0].id,
          selectedDeliveryChannel: item.slas[0].deliveryChannel,
          name: item.slas[0].name,
          lockTTL: '1d',
          deliveryWindow: item.slas[0].availableDeliveryWindows[0],
          shippingEstimate: item.slas[0].shippingEstimate,
          price: item.slas[0].price,
        }

        counter++

        return [...reIndexedItems, updatedItem]
      }

      return reIndexedItems
    },
    []
  )

  return {
    marketplaceOrderId: order_id,
    marketplaceServicesEndpoint: 'https://api.glovoapp.com/',
    marketplacePaymentValue: estimated_total_price,
    marketplaceOrderGroup: order_id,
    isCreatedAsync: true,
    items: updatedItems,
    clientProfileData: {
      email,
      firstName,
      lastName,
      documentType,
      document,
      phone,
      corporateName,
      tradeName: null,
      corporateDocument: null,
      stateInscription: null,
      corporatePhone: null,
      isCorporate: false,
      userProfileId: null,
    },
    shippingData: {
      address: {
        addressType: RESIDENTIAL,
        receiverName: `${firstName} ${lastName}`,
        addressId: HOME,
        postalCode,
        city: pickupPoints[0].address.city,
        state: pickupPoints[0].address.state,
        country: pickupPoints[0].address.country,
        street: pickupPoints[0].address.street,
        number: null,
        neighborhood: null,
        complement: null,
        reference: null,
        geoCoordinates: [],
      },
      logisticsInfo: updatedLogisticsInfo,
    },
  }
}

export const createAuthorizationPayload = (
  orderIdentifier: string,
  marketplace: boolean,
  glovoOrder: GlovoOrder
): AuthorizeOrderPayload | AuthorizeMarketplaceOrderPayload => {
  const payload = marketplace
    ? {
        marketplaceOrderGroup: 'TST-Glovo',
        authorizationReceipt: {
          date: glovoOrder.order_time,
          receipt: glovoOrder.order_code,
        },
      }
    : {
        marketplaceOrderId: orderIdentifier,
      }

  return payload
}
