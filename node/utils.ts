/* eslint-disable @typescript-eslint/naming-convention */
import type {
  OrderFormItem,
  SimulationPayload,
  PayloadItem,
} from '@vtex/clients'

import {
  INVOICED,
  ACCEPTED,
  READY_FOR_PICKUP,
  RESIDENTIAL,
  HOME,
  ESP,
  HANDLING,
} from './constants'
import glovoIds from './glovoCatalog'

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

export const convertGlovoProductsToCompare = (
  glovoProducts: GlovoProduct[]
) => {
  const items = []
  const attributesCollection = []

  for (const product of glovoProducts) {
    const { id, quantity, attributes = [], purchased_product_id } = product
    const item = {
      id,
      quantity,
      purchased_product_id,
    }

    items.push(item)
    attributesCollection.push(...attributes)
  }

  for (const attribute of attributesCollection) {
    if (attribute.purchased_product_id) {
      const { id, quantity } = attribute

      const updatedItems: GlovoProductAttributes[] = items.map((item) => {
        if (item.id === id) {
          item.quantity += quantity
        }

        return item
      })

      items.push(...updatedItems)
    }
  }

  return items
}

export const createVtexOrderData = (
  glovoOrder: GlovoOrder,
  orderSimulation: any,
  clientProfileData: ClientProfileData
): MarketplaceOrder => {
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
  const updatedItems = items.reduce((acc: any, item: any) => {
    if (isSkuAvailable(item)) {
      const updatedItem = {
        ...item,
        itemIndex: 0,
      }

      counter++

      return [...acc, updatedItem]
    }

    return acc
  }, [])

  /** Re-Index logisticsInfo array */
  counter = 0
  const updatedLogisticsInfo = logisticsInfo.reduce(
    (acc: any[], item: any, index: number) => {
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

        return [...acc, updatedItem]
      }

      return acc
    },
    []
  )

  return {
    marketplaceOrderId: order_id,
    marketplaceServicesEndpoint: 'https://api.glovoapp.com/',
    marketplacePaymentValue: estimated_total_price,
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
        country: ESP,
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

export const setGlovoStatus = (state: string) => {
  if (state === HANDLING) return ACCEPTED
  if (state === INVOICED) return READY_FOR_PICKUP

  return ''
}

export const updateGlovoProduct = async (
  ctx: Context,
  catalogUpdate: CatalogChange
) => {
  const {
    clients: { apps, glovo, checkout },
    vtex: { logger },
  } = ctx

  // Get app configuration
  const appConfig = await apps.getAppSettings(process.env.VTEX_APP_ID as string)

  if (!appConfig.glovoToken) {
    logger.warn({
      message: 'Missing Glovo token. Please check app settings',
    })

    return
  }

  const { affiliateConfig } = appConfig
  const { IdSku, IdAffiliate, IsActive } = catalogUpdate
  const affiliateInfo = affiliateConfig.find(
    ({ affiliateId }: { affiliateId: string }) => affiliateId === IdAffiliate
  )

  if (!affiliateInfo) {
    logger.warn({
      message: 'Missing or invalid affiliate information',
      catalogUpdate,
    })

    return
  }

  if (!glovoIds.includes({ skuId: IdSku })) {
    logger.info({
      message: `Product with sku ${IdSku} is not part of the Glovo Catalog`,
      catalogUpdate,
    })

    return
  }

  const { salesChannel, glovoStoreId } = affiliateInfo

  let glovoPayload: GlovoUpdateProduct = {
    available: false,
    skuId: IdSku,
    glovoStoreId,
  }

  if (IsActive) {
    const simulationItem = createSimulationItem({ id: IdSku, quantity: 1 })

    const simulation = await checkout.simulation(
      ...createSimulationPayload({
        items: [simulationItem],
        affiliateId: IdAffiliate,
        salesChannel,
      })
    )

    const {
      items: [item],
    } = simulation

    if (isSkuAvailable(item)) {
      const { price, listPrice, unitMultiplier } = item

      glovoPayload = {
        ...glovoPayload,
        price: (Math.max(price, listPrice) * unitMultiplier) / 100,
        available: true,
      }
    }
  }

  const updatedProduct = await glovo.updateProducts(ctx, glovoPayload)

  logger.info({
    message: `Product with sku ${IdSku} from store ${glovoStoreId} has been updated`,
    updatedProduct,
  })

  return updatedProduct
}
