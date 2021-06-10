/* eslint-disable @typescript-eslint/naming-convention */
import type {
  OrderFormItem,
  SimulationPayload,
  PayloadItem,
} from '@vtex/clients'

import {
  ACCEPTED,
  ESP,
  GLOVO,
  HANDLING,
  HOME,
  INVOICED,
  MENU,
  READY_FOR_PICKUP,
  RESIDENTIAL,
} from './constants'

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

export const getAffiliateFromStoreId = (
  storeId: string,
  affiliateConfig: AffiliateInfo[]
): AffiliateInfo | undefined =>
  affiliateConfig.find(({ glovoStoreId }) => glovoStoreId === storeId)

export const getAffiliateFromAffiliateId = (
  id: string,
  affiliateConfig: AffiliateInfo[]
): AffiliateInfo | undefined =>
  affiliateConfig.find(({ affiliateId }) => affiliateId === id)

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
    clients: { apps, checkout, vbase },
    vtex: { logger },
  } = ctx

  const appConfig = await apps.getAppSettings(process.env.VTEX_APP_ID as string)

  if (!appConfig.glovoToken) {
    logger.warn({
      message: 'Missing Glovo token. Please check app settings',
    })

    return
  }

  const { affiliateConfig }: { affiliateConfig: AffiliateInfo[] } = appConfig
  const { IdSku, IsActive } = catalogUpdate

  if (!affiliateConfig) {
    logger.warn({
      message: 'Missing or invalid store information',
      catalogUpdate,
    })

    return
  }

  const glovoMenu: GlovoMenu = await vbase.getJSON(GLOVO, MENU)

  if (!glovoMenu[IdSku]) {
    logger.info({
      message: `Product with sku ${IdSku} is not part of the Glovo Catalog`,
      catalogUpdate,
    })

    return
  }

  for await (const store of affiliateConfig) {
    const { affiliateId, glovoStoreId, salesChannel, postalCode } = store
    const productRecord: ProductRecord = await vbase.getJSON(
      affiliateId,
      IdSku,
      true
    )

    if (!productRecord) {
      logger.warn({
        message: `Record not found for product with sku ${IdSku}`,
        catalogUpdate,
      })

      return
    }

    let glovoPayload: GlovoUpdateProduct = {
      glovoStoreId,
      skuId: IdSku,
      price: productRecord.price,
      available: false,
    }

    // Check if product is active
    if (IsActive) {
      const simulationItem = createSimulationItem({ id: IdSku, quantity: 1 })

      const simulation = await checkout.simulation(
        ...createSimulationPayload({
          items: [simulationItem],
          affiliateId,
          salesChannel,
          postalCode,
          country: 'ESP',
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

    if (
      productRecord.price === glovoPayload.price &&
      productRecord.available === glovoPayload.available
    ) {
      logger.info({
        message: `Product with sku ${IdSku} already up to date`,
        productRecord,
      })

      continue
    }

    try {
      const updatedProductRecord: ProductRecord = {
        id: IdSku,
        price: glovoPayload.price,
        available: glovoPayload.available,
      }

      // Update product record
      vbase.saveJSON(affiliateId, IdSku, updatedProductRecord)

      // Get Menu Updates Record
      const menuUpdates: MenuUpdatesItem[] = await vbase.getJSON(
        affiliateId,
        MENU,
        true
      )

      if (!menuUpdates) {
        logger.warn({
          message: `Unable to get Menu Updates record`,
          data: glovoPayload,
        })

        return
      }

      const currentUpdateItemsIds = menuUpdates[
        menuUpdates.length - 1
      ].items.map((item) => item.id)

      if (!currentUpdateItemsIds.includes(IdSku)) {
        menuUpdates[menuUpdates.length - 1].items.push(updatedProductRecord)
      } else {
        menuUpdates[menuUpdates.length - 1].items.map((item) => {
          if (item.id === IdSku) {
            item.id = IdSku
            item.price = updatedProductRecord.price
            item.available = updatedProductRecord.available
          }

          return item
        })
      }

      vbase.saveJSON(affiliateId, MENU, menuUpdates)

      logger.info({
        message: `Product with sku ${IdSku} from store ${glovoStoreId} has been updated`,
        updatedProductRecord,
      })

      return updatedProductRecord
    } catch (error) {
      logger.error({
        message: `Product with sku ${IdSku} from store ${glovoStoreId} could not be updated`,
        data: error,
      })

      return error
    }
  }
}

export const updateGlovoMenuAll = async (ctx: Context) => {
  const {
    clients: { apps, checkout, glovo, vbase },
    vtex: { logger },
  } = ctx

  const appConfig = await apps.getAppSettings(process.env.VTEX_APP_ID as string)

  if (!appConfig.glovoToken) {
    logger.warn({
      message: 'Missing or invalid Glovo token. Please check app settings',
    })

    return
  }

  const { affiliateConfig }: { affiliateConfig: AffiliateInfo[] } = appConfig

  if (!affiliateConfig.length) {
    logger.warn({
      message: 'Missing or invalid stores information',
    })

    return
  }

  const glovoMenu: GlovoMenu = await vbase.getJSON(GLOVO, MENU)

  // Send a complete bulk product update for each store
  for await (const store of affiliateConfig) {
    const { affiliateId, salesChannel, glovoStoreId } = store

    const glovoPayload: GlovoBulkUpdateProduct = {
      products: [],
    }

    for await (const sku of Object.keys(glovoMenu)) {
      const simulationItem = createSimulationItem({
        id: sku,
        quantity: 1,
      })

      const simulation = await checkout.simulation(
        ...createSimulationPayload({
          items: [simulationItem],
          affiliateId,
          salesChannel,
        })
      )

      if (simulation.items.length) {
        const {
          items: [item],
        } = simulation

        const { id, price, listPrice, unitMultiplier, availability } = item
        const payloadProduct: GlovoPatchProduct = {
          id,
          price: (Math.max(price, listPrice) * unitMultiplier) / 100,
          available: availability === 'available',
        }

        glovoPayload.products.push(payloadProduct)
      } else {
        const payloadProduct: GlovoPatchProduct = {
          id: sku,
          available: false,
        }

        glovoPayload.products.push(payloadProduct)
      }
    }

    try {
      const glovoResponse = await glovo.bulkUpdateProducts(
        ctx,
        glovoPayload,
        glovoStoreId
      )

      logger.info({
        message: `Catalog for store ${glovoStoreId} has been updated`,
        glovoResponse,
        glovoPayload,
      })
    } catch (error) {
      logger.error({
        message: `Catalog for store ${glovoStoreId} could not be updated`,
        data: error,
      })
    }
  }
}

export const updateGlovoMenuPartial = async (ctx: Context) => {
  const {
    clients: { apps, glovo, vbase },
    vtex: { logger },
  } = ctx

  const appConfig = await apps.getAppSettings(process.env.VTEX_APP_ID as string)

  if (!appConfig.glovoToken) {
    logger.warn({
      message: 'Missing or invalid Glovo token. Please check app settings',
    })

    return
  }

  const { affiliateConfig }: { affiliateConfig: AffiliateInfo[] } = appConfig

  if (!affiliateConfig.length) {
    logger.warn({
      message: 'Missing or invalid stores information',
    })

    return
  }

  // Send a partial bulk product update for each store
  for await (const store of affiliateConfig) {
    const { affiliateId, glovoStoreId } = store

    let menuUpdates: MenuUpdatesItem[] = await vbase.getJSON(affiliateId, MENU)
    const currentUpdate: MenuUpdatesItem = menuUpdates[menuUpdates.length - 1]

    const glovoPayload: GlovoBulkUpdateProduct = {
      products: currentUpdate.items,
    }

    try {
      const glovoResponse: GlovoBulkUpdateResponse = await glovo.bulkUpdateProducts(
        ctx,
        glovoPayload,
        glovoStoreId
      )

      const newUpdate: MenuUpdatesItem = {
        requestId: ctx.headers.requestId,
        responseId: null,
        createdAt: new Date().toString(),
        storeId: affiliateId,
        glovoStoreId,
        items: [],
      }

      currentUpdate.responseId = glovoResponse.transaction_id
      menuUpdates.splice(-1, 1, currentUpdate)
      menuUpdates = [...menuUpdates, newUpdate]

      vbase.saveJSON(affiliateId, MENU, menuUpdates)

      logger.info({
        message: `Menu for store ${affiliateId} was updated`,
        data: menuUpdates,
      })
    } catch (error) {
      logger.error({
        message: `Partial Catalog for store ${glovoStoreId} could not be updated`,
        data: error,
      })
    }
  }
}
