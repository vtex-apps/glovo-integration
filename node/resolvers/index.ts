import { getGlovoIntegrationSettings } from './getAppSettings'
import { saveGlovoIntegrationSettings } from './saveAppSettings'

const queries = {
  getGlovoIntegrationSettings,
}

const mutations = {
  saveGlovoIntegrationSettings,
}

export const resolvers = {
  Query: {
    ...queries,
  },
  Mutation: {
    ...mutations,
  },
}
