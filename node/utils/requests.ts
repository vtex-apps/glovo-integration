/**
 * Utility function to delay execution of your current process
 * @param miliseconds Miliseconds to delay the resolve
 */
export function delayFor(miliseconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, miliseconds)
  })
}

/**
 * Utility function to retry the request passed.
 *
 * @param request Request to be made
 * @param retries Number of retries to be made. Defaults to 2
 * @param delay Dealy in milliseconds to wait between retries. Defaults to 500 miliseconds
 * @returns request response or request error
 */
export async function requestWithRetries<T>(
  request: unknown,
  retries = 2,
  delay = 500
): Promise<T> {
  try {
    const response = (await request) as T

    return response
  } catch (error) {
    if (retries === 0) {
      throw error
    }

    await delayFor(delay)

    return requestWithRetries(request, retries - 1)
  }
}
