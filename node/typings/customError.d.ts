declare namespace CustomError {
  type Data = {
    message: string
    reason: string
    status: number
    workflowType: WorkflowType
    workflowInstance: WorkflowInstance
    payload?: unknown
    error?: unknown
  }

  interface Workflows {
    Menu: 'Check' | 'Complete Update' | 'Partial update'
    Orders: 'Simulation' | 'Creation' | 'Authorization' | 'Change'
    Products: 'Update'
  }

  type WorkflowType = keyof Workflows
  type WorkflowInstance = Workflows[keyof Workflows]
}
