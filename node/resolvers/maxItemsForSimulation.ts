import type { MaxItemsForSimulation } from 'vtex.glovo-integration'

import { GLOVO, MAX_ITEMS_FOR_SIMULATION } from '../constants'

export async function getMaxItemsForSimulation(
  _root: unknown,
  _args: unknown,
  ctx: Context
): Promise<MaxItemsForSimulation | null> {
  const {
    clients: { vbase },
  } = ctx

  try {
    const maxItemsForSimulation: MaxItemsForSimulation = await vbase.getJSON(
      GLOVO,
      MAX_ITEMS_FOR_SIMULATION,
      true
    )

    return maxItemsForSimulation
  } catch (error) {
    return null
  }
}

export async function updateMaxItemsForSimulation(
  _root: unknown,
  { max }: { max: number },
  ctx: Context
): Promise<MaxItemsForSimulation | null> {
  const {
    clients: { vbase },
  } = ctx

  try {
    await vbase.saveJSON(GLOVO, MAX_ITEMS_FOR_SIMULATION, { max })

    return { max }
  } catch (error) {
    return null
  }
}
