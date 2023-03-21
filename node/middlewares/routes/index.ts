import { method } from '@vtex/api'

import { authorizeOrder } from './authorizeOrder'
import { checkOrderRecord } from './checkOrderRecord'
import { createOrder } from './createOrder'
import { errorHandler } from './errorHandler'
import { getGlovoMenu } from './getGlovoMenu'
import { getGlovoMenuByStore } from './getGlovoMenuByStore'
import { glovoMenuCompleteUpdate } from './glovoMenuCompleteUpdate'
import { glovoMenuPartialUpdate } from './glovoMenuPartialUpdate'
import { glovoProductUpdate } from './glovoProductUpdate'
import { orderChange } from './orderChange'
import { saveGlovoMenu } from './saveGlovoMenu'
import { saveOrderRecord } from './saveOrderRecord'
import { sendResponse } from './sendReponse'
import { simulateOrder } from './simulateOrder'
import { storeMenuUpdates } from './storeMenuUpdate'
import { validateGlovoToken } from './validateGlovoToken'
import { validateSettings } from './validateSettings'

export const routes = {
  createOrder: method({
    POST: [
      errorHandler,
      validateSettings,
      validateGlovoToken,
      checkOrderRecord,
      simulateOrder,
      createOrder,
      authorizeOrder,
      saveOrderRecord,
    ],
  }),
  updateProduct: method({
    POST: [glovoProductUpdate, sendResponse],
  }),
  updateCompleteMenu: method({
    POST: [glovoMenuCompleteUpdate, sendResponse],
  }),
  updatePartialMenu: method({
    POST: [glovoMenuPartialUpdate, sendResponse],
  }),
  glovoMenu: method({
    GET: [errorHandler, getGlovoMenu],
    POST: [errorHandler, saveGlovoMenu],
  }),
  getGlovoMenuByStore: method({
    GET: [errorHandler, validateSettings, getGlovoMenuByStore],
  }),
  storeMenuUpdates: method({
    GET: [errorHandler, validateSettings, storeMenuUpdates],
  }),
  orderChange: method({
    POST: [errorHandler, orderChange],
  }),
}
