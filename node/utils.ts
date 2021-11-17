/* eslint-disable @typescript-eslint/naming-convention */
import type {
  OrderFormItem,
  SimulationPayload,
  PayloadItem,
  Checkout,
} from '@vtex/clients'

import {
  ACCEPTED,
  HANDLING,
  HOME,
  INVOICED,
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

const simulateItem = async (
  IdSku: string,
  store: StoreInfo,
  checkout: Checkout
): Promise<{ price: number; available: boolean }> => {
  const { storeId, salesChannel, postalCode, country } = store
  const simulationItem = createSimulationItem({ id: IdSku, quantity: 1 })

  const simulation = await checkout.simulation(
    ...createSimulationPayload({
      items: [simulationItem],
      storeId,
      salesChannel,
      postalCode,
      country,
    })
  )

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

export const getStoreInfoFormGlovoStoreId = (
  id: string,
  storesConfig: StoreInfo[]
): StoreInfo | undefined =>
  storesConfig.find(({ glovoStoreId }) => glovoStoreId === id)

export const getStoreInfoFromStoreId = (
  id: string,
  storesConfig: StoreInfo[]
): StoreInfo | undefined => storesConfig.find(({ storeId }) => storeId === id)

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
    clients: { apps, checkout, recordsManager },
    vtex: { logger },
  } = ctx

  const appConfig = await apps.getAppSettings(process.env.VTEX_APP_ID as string)

  if (!appConfig.glovoToken) {
    logger.warn({
      message: 'Missing Glovo token. Please check app settings',
    })

    return
  }

  const { storesConfig }: { storesConfig: StoreInfo[] } = appConfig
  const { IdSku, IsActive } = catalogUpdate

  if (!storesConfig) {
    logger.warn({
      message: 'Missing or invalid store information',
      catalogUpdate,
    })

    return
  }

  const glovoMenu = await recordsManager.getGlovoMenu()

  if (!glovoMenu[IdSku]) {
    logger.info({
      message: `Product with sku ${IdSku} is not part of the Glovo Catalog`,
      catalogUpdate,
    })

    return
  }

  for await (const store of storesConfig) {
    const { storeId, glovoStoreId } = store
    let newProduct = false
    let productRecord = await recordsManager.getProductRecord(storeId, IdSku)

    if (!productRecord) {
      logger.warn({
        message: `Record not found for product with sku ${IdSku}`,
        catalogUpdate,
      })

      if (!IsActive) {
        continue
      }

      newProduct = true

      const { price, available } = await simulateItem(IdSku, store, checkout)

      const newProductRecord: ProductRecord = {
        id: IdSku,
        available,
      }

      if (available) {
        newProductRecord.price = price
      }

      productRecord = newProductRecord
    }

    let glovoPayload: GlovoUpdateProduct = {
      skuId: IdSku,
      available: false,
      glovoStoreId,
    }

    if (IsActive) {
      const { price, available } = await simulateItem(IdSku, store, checkout)

      glovoPayload = { ...glovoPayload, available }

      if (available) {
        glovoPayload.price = price
      }
    }

    if (
      !newProduct &&
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

      recordsManager.saveProductRecord(storeId, IdSku, updatedProductRecord)

      let storeMenuUpdates = await recordsManager.getStoreMenuUpdates(storeId)

      if (!storeMenuUpdates) {
        // If the Store Menu Updates Record does not exist already, it is created.
        storeMenuUpdates = {
          current: {
            responseId: null,
            createdAt: Date.now(),
            storeId,
            glovoStoreId,
            items: [],
          },
        }
      }

      const currentUpdateItemsIds = storeMenuUpdates.current.items.map(
        (item) => item.id
      )

      if (!currentUpdateItemsIds.includes(IdSku)) {
        storeMenuUpdates.current.items.push(updatedProductRecord)
      } else {
        storeMenuUpdates.current.items.map((item) => {
          if (item.id === IdSku) {
            item.id = IdSku
            item.price = updatedProductRecord.price
            item.available = updatedProductRecord.available
          }

          return item
        })
      }

      recordsManager.saveStoreMenuUpdates(storeId, storeMenuUpdates)

      logger.info({
        message: `Created new Menu Updates record for store ${storeId}`,
        data: storeMenuUpdates,
      })

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
    clients: { apps, checkout, glovo, recordsManager },
    vtex: { logger },
  } = ctx

  const appConfig = await apps.getAppSettings(process.env.VTEX_APP_ID as string)

  if (!appConfig.glovoToken) {
    logger.warn({
      message: 'Missing or invalid Glovo token. Please check app settings',
    })

    return
  }

  const { storesConfig }: { storesConfig: StoreInfo[] } = appConfig

  if (!storesConfig.length) {
    logger.warn({
      message: 'Missing or invalid stores information',
    })

    return
  }

  const glovoMenu = await recordsManager.getGlovoMenu()

  // Send a complete bulk product update for each store
  for await (const store of storesConfig) {
    const { storeId, salesChannel, glovoStoreId } = store

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
          storeId,
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
    clients: { apps, glovo, recordsManager },
    vtex: { logger },
  } = ctx

  const appConfig = await apps.getAppSettings(process.env.VTEX_APP_ID as string)

  if (!appConfig.glovoToken) {
    logger.warn({
      message: 'Missing or invalid Glovo token. Please check app settings',
    })

    return
  }

  const { storesConfig }: { storesConfig: StoreInfo[] } = appConfig

  if (!storesConfig.length) {
    logger.warn({
      message: 'Missing or invalid stores information',
    })

    return
  }

  // Send a partial bulk product update for each store
  for await (const store of storesConfig) {
    const { storeId, glovoStoreId } = store

    try {
      const menuUpdates = await recordsManager.getStoreMenuUpdates(storeId)

      const { current: currentUpdate } = menuUpdates

      const glovoPayload: GlovoBulkUpdateProduct = {
        products: currentUpdate.items,
      }

      const newUpdate: MenuUpdatesItem = {
        responseId: null,
        createdAt: new Date().getTime(),
        storeId,
        glovoStoreId,
        items: [],
      }

      const glovoResponse = await glovo.bulkUpdateProducts(
        ctx,
        glovoPayload,
        glovoStoreId
      )

      currentUpdate.responseId = glovoResponse.transaction_id
      menuUpdates.previous = currentUpdate
      menuUpdates.current = newUpdate

      recordsManager.saveStoreMenuUpdates(storeId, menuUpdates)

      logger.info({
        message: `Menu for store ${storeId} was updated`,
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
