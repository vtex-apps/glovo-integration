interface ErrorParams {
  message: string
  reason: string
  metric: ErrorMetric
  data?: unknown
  error?: unknown
}

type ErrorMetric = 'menu' | 'orders' | 'products'
