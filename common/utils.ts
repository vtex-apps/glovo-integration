type Inputs = Record<string, any>

export const validateInputs = (inputs: Inputs): boolean => {
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
