export const errorHandler = (error) => {
  if (error.response) {
    return error.response.data.error || 'Server Error'
  } else if (error.request) {
    return 'No response from server'
  } else {
    return error.message
  }
}