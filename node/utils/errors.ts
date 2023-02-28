export class ServiceError extends Error {
  constructor({ message, reason, metric, data, error }: Errors.Params) {
    super(message)
    this.reason = reason
    this.metric = metric
    this.data = data ?? 'No data provided'
    this.error = error ?? 'No error information'
  }

  public reason: string
  public metric: Errors.Metric
  public data: unknown
  public error: unknown
}
