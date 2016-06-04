export function setErrorMessage (message) {
  return {
    type: 'SET_ERROR_MESSAGE',
    message
  }
}

export function clearStatusModal () {
  return {
    type: 'CLEAR_STATUS_MODAL'
  }
}
