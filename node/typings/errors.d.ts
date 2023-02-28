declare namespace Errors {
  type Params = {
    message: string
    reason: string
    metric: Metric
    data?: unknown
    error?: unknown
  }

  type Metric = 'menu' | 'orders' | 'products'
}
