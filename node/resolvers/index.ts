import { getGlovoIntegrationSettings } from './getAppSettings'
import { saveGlovoIntegrationSettings } from './saveAppSettings'
import {
  getMaxItemsForSimulation,
  updateMaxItemsForSimulation,
} from './maxItemsForSimulation'

const queries = {
  getGlovoIntegrationSettings,
  getMaxItemsForSimulation,
}

const mutations = {
  saveGlovoIntegrationSettings,
  updateMaxItemsForSimulation,
}

export const resolvers = {
  Query: {
    ...queries,
  },
  Mutation: {
    ...mutations,
  },
}
