export const validateInputs = (inputs: Record<string, any>): boolean => {
  for (const key in inputs) {
    if (inputs[key] === '' || inputs[key] === undefined) {
      return false
    }

    if (typeof inputs[key] === 'object') {
      if (!validateInputs(inputs[key])) {
        return false
      }
    }
  }

  return true
}
