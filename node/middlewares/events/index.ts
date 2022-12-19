import { compareOrder } from './compareOrder'
import { eventsErrorHandler } from './eventsErrorHandler'
import { updateGlovoOrderStatus } from './updateGlovoOrderStatus'
import { validateEventSettings } from './validateEventSettings'

export const events = {
  updateGlovoOrder: [
    eventsErrorHandler,
    validateEventSettings,
    compareOrder,
    updateGlovoOrderStatus,
  ],
}
