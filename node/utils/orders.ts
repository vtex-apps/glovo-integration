/* eslint-disable max-params */

import { RESIDENTIAL, HOME } from '../constants'
import { isSkuAvailable } from './utils'

/* eslint-disable @typescript-eslint/naming-convention */
export const createVtexOrderData = (
  glovoOrder: GlovoOrder,
  orderSimulation: any,
  clientProfileData: ClientProfileData,
  marketplace: boolean,
  account: string
): CreateOrderPayload => {
  const {
    order_id,
    customer: { name, phone_number },
  } = glovoOrder

  const { items, pickupPoints, postalCode, logisticsInfo, totals } =
    orderSimulation

  const {
    email,
    firstName,
    lastName,
    documentType,
    document,
    phone,
    corporateName,
  } = clientProfileData

  /** Check if Glovo sends customer name */
  const customerName = name ?? `${firstName} ${lastName}`

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

  const totalValue = totals.reduce(
    (total: number, item: SimulationTotalsItem) => (total += item.value),
    0
  )

  const vtexOrderData: CreateOrderPayload = {
    marketplaceOrderId: order_id,
    marketplaceServicesEndpoint: `https://${account}.myvtex.com`,
    marketplacePaymentValue: totalValue,
    marketplaceOrderGroup: order_id,
    isCreatedAsync: true,
    items: updatedItems,
    savePersonalData: false,
    clientProfileData: {
      email: getEmail(customerName, phone_number, email),
      firstName: getFirstName(customerName),
      lastName: getLastName(customerName),
      documentType,
      document,
      phone: phone_number ?? phone,
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
        receiverName: getReceiverName(customerName, phone_number),
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

  if (marketplace) {
    vtexOrderData.paymentData = {
      payments: [
        {
          installments: 1,
          paymentSystem: glovoOrder.payment_method,
          referenceValue: totalValue,
          value: totalValue,
        },
      ],
    }
  }

  return vtexOrderData
}

export const createAuthorizationPayload = (
  orderIdentifier: string,
  marketplace: boolean,
  glovoOrder: GlovoOrder
): AuthorizeOrderPayload | AuthorizeMarketplaceOrderPayload => {
  const payload = marketplace
    ? {
        marketplaceOrderGroup: orderIdentifier,
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

function getEmail(name: string, phone_number: string, email: string) {
  return (
    `${name.replace(/\W/g, '').toLowerCase()}_${phone_number.replace(
      /\W/g,
      ''
    )}@vtex-glovo.com` ?? email
  )
}

function getFirstName(name: string) {
  return name.split(' ')[0]
}

function getLastName(name: string) {
  return name.split(' ')[1]
}

function getReceiverName(name: string, phone_number: string) {
  return `${name} - ${phone_number}`
}
