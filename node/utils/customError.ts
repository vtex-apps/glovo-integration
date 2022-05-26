type CustomErrorProps = {
  message: string
  status: number
  payload?: unknown
  error?: unknown
}

export class CustomError extends Error {
  constructor({ message, status, payload, error }: CustomErrorProps) {
    super(message)
    this.status = status
    this.payload = payload ?? null
    this.error = error ?? null
  }

  public readonly status: number
  public readonly payload: unknown
  public readonly error: unknown
}
