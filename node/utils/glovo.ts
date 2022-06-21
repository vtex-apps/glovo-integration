import {
  ACCEPTED,
  INVOICED,
  READY_FOR_PICKUP,
  GLOVO,
  APP_SETTINGS,
  READY_FOR_HANDLING,
  WAITING_SELLER_HANDLING,
} from '../constants'
import {
  createSimulationItem,
  createSimulationPayload,
  simulateItem,
} from './simulation'

export const setGlovoStatus = (state: string) => {
  if (state === WAITING_SELLER_HANDLING) return ACCEPTED
  if (state === READY_FOR_HANDLING) return ACCEPTED
  if (state === INVOICED) return READY_FOR_PICKUP

  return ''
}

export const updateGlovoProduct = async (
  ctx: Context,
  catalogUpdate: CatalogChange
) => {
  const {
    clients: { vbase, checkout, recordsManager },
    vtex: { logger },
  } = ctx

  const appSettings: AppSettings = await vbase.getJSON(
    GLOVO,
    APP_SETTINGS,
    true
  )

  if (!appSettings.glovoToken) {
    logger.warn({
      message: 'Missing Glovo token. Please check app settings',
    })

    return
  }

  const { stores }: { stores: StoreInfo[] } = appSettings
  const { IdSku, IsActive } = catalogUpdate

  if (!stores) {
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

  for await (const store of stores) {
    const { id, storeName, glovoStoreId } = store
    let newProduct = false
    let productRecord = await recordsManager.getProductRecord(
      glovoStoreId,
      IdSku
    )

    if (!productRecord) {
      if (!IsActive) {
        continue
      }

      newProduct = true

      const { price, available } = await simulateItem(IdSku, store, checkout)

      const newProductRecord: ProductRecord = {
        id: IdSku,
        available,
        price,
      }

      productRecord = newProductRecord
    }

    let glovoPayload: GlovoUpdateProduct = {
      skuId: IdSku,
      glovoStoreId,
    }

    if (IsActive) {
      const { price, available } = await simulateItem(IdSku, store, checkout)

      if (price) {
        glovoPayload = {
          ...glovoPayload,
          price,
          available,
        }
      } else {
        glovoPayload.available = false
      }
    }

    if (
      !newProduct &&
      productRecord.price === glovoPayload.price &&
      productRecord.available === glovoPayload.available
    ) {
      continue
    }

    try {
      const updatedProductRecord: ProductRecord = {
        id: IdSku,
        price: glovoPayload.price,
        available: glovoPayload.available,
      }

      recordsManager.saveProductRecord(
        glovoStoreId,
        IdSku,
        updatedProductRecord
      )

      let storeMenuUpdates = await recordsManager.getStoreMenuUpdates(
        glovoStoreId
      )

      if (!storeMenuUpdates) {
        // If the Store Menu Updates Record does not exist already, it is created.
        storeMenuUpdates = {
          current: {
            responseId: null,
            createdAt: Date.now(),
            storeId: id,
            storeName,
            glovoStoreId,
            items: [],
          },
        }

        logger.info({
          message: `Created new Menu Updates record for store ${storeName} with id ${id}`,
          data: storeMenuUpdates,
        })
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

      recordsManager.saveStoreMenuUpdates(glovoStoreId, storeMenuUpdates)

      logger.info({
        message: `Product with sku ${IdSku} from store ${glovoStoreId} has been updated`,
        updatedProductRecord,
      })
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
    clients: { vbase, checkout, glovo, recordsManager },
    vtex: { logger },
  } = ctx

  const appSettings: AppSettings = await vbase.getJSON(
    GLOVO,
    APP_SETTINGS,
    true
  )

  if (!appSettings.glovoToken) {
    logger.warn({
      message: 'Missing or invalid Glovo token. Please check app settings',
    })

    return
  }

  const { stores }: { stores: StoreInfo[] } = appSettings

  if (!stores.length) {
    logger.warn({
      message: 'Missing or invalid stores information',
    })

    return
  }

  const glovoMenu = await recordsManager.getGlovoMenu()

  // Send a complete bulk product update for each store
  for await (const store of stores) {
    const { affiliateId, sellerId, salesChannel, glovoStoreId } = store

    const glovoPayload: GlovoBulkUpdateProduct = {
      products: [],
    }

    for await (const sku of Object.keys(glovoMenu)) {
      const simulationItem = createSimulationItem({
        id: sku,
        quantity: 1,
        sellerId,
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
    clients: { vbase, glovo, recordsManager },
    vtex: { logger },
  } = ctx

  const appSettings: AppSettings = await vbase.getJSON(
    GLOVO,
    APP_SETTINGS,
    true
  )

  if (!appSettings.glovoToken) {
    logger.warn({
      message: 'Missing or invalid Glovo token. Please check app settings',
    })

    return
  }

  const { stores }: { stores: StoreInfo[] } = appSettings

  if (!stores.length) {
    logger.warn({
      message: 'Missing or invalid stores information',
    })

    return
  }

  // Send a partial bulk product update for each store
  for await (const store of stores) {
    const { id, storeName, glovoStoreId } = store

    try {
      const menuUpdates = await recordsManager.getStoreMenuUpdates(glovoStoreId)

      const { current: currentUpdate } = menuUpdates

      const glovoPayload: GlovoBulkUpdateProduct = {
        products: currentUpdate.items,
      }

      const newUpdate: MenuUpdatesItem = {
        responseId: null,
        createdAt: new Date().getTime(),
        storeId: id,
        storeName,
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

      recordsManager.saveStoreMenuUpdates(glovoStoreId, menuUpdates)

      logger.info({
        message: `Menu for store ${storeName} with id ${id} was updated`,
        data: menuUpdates,
      })
    } catch (error) {
      logger.error({
        message: `Partial Catalog for store ${storeName} with ${id} could not be updated`,
        data: error,
      })
    }
  }
}
