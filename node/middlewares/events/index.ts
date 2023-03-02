import { eventsErrorHandler } from './eventsErrorHandler'
import { modifyGlovoOrder } from './modifyGlovoOrder'
import { updateGlovoOrderStatus } from './updateGlovoOrderStatus'
import { validateEventSettings } from './validateEventSettings'

export const events = {
  updateGlovoOrder: [
    eventsErrorHandler,
    validateEventSettings,
    modifyGlovoOrder,
    updateGlovoOrderStatus,
  ],
}
