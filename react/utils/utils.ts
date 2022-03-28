export const validateInputs = (inputs: { [key: string]: any }): boolean => {
  for (const key in inputs) {
    if (inputs[key] === 'object') {
      validateInputs(inputs[key])
    }

    const value = inputs[key]

    if (!value) {
      return false
    }
  }

  return true
}
