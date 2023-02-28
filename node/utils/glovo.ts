import type { OrderFormItem, SimulationOrderForm } from '@vtex/clients'

import {
  ACCEPTED,
  INVOICED,
  READY_FOR_PICKUP,
  GLOVO,
  APP_SETTINGS,
  READY_FOR_HANDLING,
  WAITING_SELLER_HANDLING,
} from '../constants'
import { ServiceError } from './errors'
import {
  createGlovoBulkUpdatePayload,
  createSimulationItems,
  createSimulationPayload,
  iterationLimits,
  MAX_ITEMS_FOR_SIMULATION,
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
    clients: { vbase, recordsManager },
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

  const { stores } = appSettings
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
    return
  }

  for await (const store of stores) {
    const { id, storeName, glovoStoreId } = store

    const simulation = await simulateItem(IdSku, store, ctx)

    if (!simulation) {
      logger.warn({
        message: `Simulation failed for product with sku ${IdSku} for store ${storeName}`,
        catalogUpdate,
      })

      continue
    }

    const { price, available } = simulation

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

    if (IsActive && price) {
      glovoPayload = {
        ...glovoPayload,
        price,
        available,
      }
    } else {
      glovoPayload.available = false
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
        data: error.response,
      })

      return error
    }
  }
}

export const updateGlovoCompleteMenu = async (ctx: Context) => {
  const {
    clients: { vbase, checkout, glovo, recordsManager },
    vtex: { logger },
  } = ctx

  try {
    const appSettings: AppSettings = await vbase.getJSON(
      GLOVO,
      APP_SETTINGS,
      true
    )

    if (!appSettings?.glovoToken) {
      logger.warn({
        message: 'Menu update for stores failed',
        reason: 'Missing or invalid Glovo token. Please check app settings',
      })

      return
    }

    const { stores, minimumStock } = appSettings

    if (!stores.length) {
      logger.warn({
        message: 'Menu update for stores failed',
        reason: 'Missing or invalid stores information',
      })

      return
    }

    const glovoMenu = await recordsManager.getGlovoMenu()
    const iterations = Math.ceil(
      Object.keys(glovoMenu).length / MAX_ITEMS_FOR_SIMULATION
    )

    for await (const store of stores) {
      logger.info({
        message: `Updating menu for store ${store.storeName}`,
      })

      const {
        affiliateId,
        sellerId,
        salesChannel,
        glovoStoreId,
        storeName,
        postalCode,
        country,
      } = store

      let payloadItems: OrderFormItem[] = []

      for (let i = 0; i < iterations; i++) {
        const [from, to] = iterationLimits(i)

        const itemsForSimulation = Object.keys(glovoMenu).slice(from, to)

        const simulationItems = createSimulationItems(
          itemsForSimulation,
          minimumStock,
          sellerId
        )

        const [simulationPayload, querystring] = createSimulationPayload({
          items: simulationItems,
          affiliateId,
          salesChannel,
          postalCode,
          country,
        })

        let simulation = {} as SimulationOrderForm

        try {
          // eslint-disable-next-line no-await-in-loop
          simulation = await checkout.simulation(simulationPayload, querystring)
        } catch (error) {
          logger.warn({
            message: `Catalog update for store ${storeName} - ${glovoStoreId} failed`,
            reason: `Simulation for items failed`,
          })

          continue
        }

        if (!simulation.items.length) {
          logger.warn({
            message: `Catalog update for store ${storeName} - ${glovoStoreId} failed`,
            reason: `Simulation returned no items`,
          })

          continue
        }

        payloadItems = [...payloadItems, ...simulation.items]
      }

      const glovoPayload = createGlovoBulkUpdatePayload(
        payloadItems,
        minimumStock
      )

      try {
        // eslint-disable-next-line no-await-in-loop
        const glovoResponse = await glovo.bulkUpdateProducts(
          ctx,
          glovoPayload,
          glovoStoreId
        )

        recordsManager.saveStoreCompleteMenuUpdate(glovoStoreId, {
          items: [...glovoPayload.products],
          transactionId: glovoResponse.transaction_id,
          lastUpdated: Date(),
        })

        logger.info({
          message: `Catalog for store ${storeName} - ${glovoStoreId} has been updated. (${payloadItems.length} items)`,
          glovoResponse,
        })
      } catch (error) {
        logger.error({
          message: `Catalog for store ${storeName} - ${glovoStoreId} could not be updated`,
          reason: `Bulk update request failed`,
        })

        continue
      }
    }
  } catch (error) {
    throw new ServiceError({
      message: error.message,
      reason: error.reason ?? 'Catalog update for stores failed',
      metric: 'menu',
      data: error.response?.data,
    })
  }
}

export const updateGlovoPartialMenu = async (ctx: Context) => {
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
        data: error.response,
      })
    }
  }
}
