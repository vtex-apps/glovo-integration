type CustomErrorProps = {
  message: string
  status: number
  payload?: unknown
}

export class CustomError extends Error {
  constructor({ message, status, payload }: CustomErrorProps) {
    super(message)
    this.status = status
    this.payload = payload ?? null
  }

  public readonly status: number
  public readonly payload: unknown
}
