export class CustomError extends Error {
  constructor({
    message,
    reason,
    status,
    workflowType,
    workflowInstance,
    payload,
    error,
  }: CustomError.Data) {
    super(message)
    this.reason = reason
    this.status = status
    this.workflowType = workflowType
    this.workflowInstance = workflowInstance
    this.payload = payload ?? 'No payload provided'
    this.error = error ?? 'No error information'
  }

  public reason: string
  public status: number
  public workflowType: CustomError.WorkflowType
  public workflowInstance: CustomError.WorkflowInstance
  public payload: unknown
  public error: unknown
}
