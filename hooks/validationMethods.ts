export const validationProcedure = (
  validationMethod: (stringToValidate: string) => boolean,
  data: string // access to the form data
  // errors: string[] // includes the errors to show
) => {
  if (!validationMethod(data)) {
    // Not valid
    return false
  } else {
    // Valid
    return true
  }
}
