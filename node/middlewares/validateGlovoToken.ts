import { AuthenticationError } from '@vtex/api'

export async function validateGlovoToken(
  ctx: Context,
  next: () => Promise<void>
) {
  const {
    req: { headers },
    state: { glovoToken },
  } = ctx

  const reqAuth = headers.authorization

  if (!reqAuth || reqAuth !== glovoToken) {
    throw new AuthenticationError('Missing or invalid token')
  }

  await next()
}
