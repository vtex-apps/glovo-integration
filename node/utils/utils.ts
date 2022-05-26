/* eslint-disable @typescript-eslint/naming-convention */
import type { OrderFormItem, PayloadItem } from '@vtex/clients'

import { createSimulationItem } from './simulation'

export const isSkuAvailable = (item: OrderFormItem | undefined): boolean => {
  if (!item) {
    return false
  }

  return item.availability === 'available'
}

export const getStoreInfoFormGlovoStoreId = (
  id: string,
  stores: StoreInfo[]
): StoreInfo | undefined =>
  stores.find(({ glovoStoreId }) => glovoStoreId === id)

export const getStoreInfoFromStoreId = (
  id: string,
  stores: StoreInfo[]
): StoreInfo | undefined => stores.find(({ affiliateId }) => affiliateId === id)

export const convertGlovoProductToItems = (
  sellerId: string,
  glovoProducts: GlovoProduct[] = []
): PayloadItem[] => {
  const items = []
  const attributesCollection = []

  for (const product of glovoProducts) {
    const { id, quantity, attributes = [] } = product
    const item = createSimulationItem({ id, quantity, sellerId })

    items.push(item)
    attributesCollection.push(...attributes)
  }

  for (const attribute of attributesCollection) {
    const { id, quantity } = attribute
    const item = createSimulationItem({ id, quantity, sellerId })

    items.push(item)
  }

  return items
}

type ProductsToCompare = {
  id: string
  quantity: number
  purchased_product_id: string
}

export const convertGlovoProductsToCompare = (
  glovoProducts: GlovoProduct[]
) => {
  const items: ProductsToCompare[] = []
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

      const updatedItems = items.map((item) => {
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

export const isValidAffiliateId = (affiliateId: string) => {
  if (Number(affiliateId)) {
    return false
  }

  return true
}
