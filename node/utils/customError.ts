export type CustomErrorProps = {
  message: string
  reason: string
  status: number
  payload?: unknown
  error?: unknown
}

export class CustomError extends Error {
  constructor({ message, reason, status, payload, error }: CustomErrorProps) {
    super(message)
    this.reason = reason
    this.status = status
    this.payload = payload ?? null
    this.error = error ?? null
  }

  public readonly reason: string
  public readonly status: number
  public readonly payload: unknown
  public readonly error: unknown
}
