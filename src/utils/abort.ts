import { createError } from './create-error'

export function abort<T>(message: string, attributes?: T) {
  let error = createError(message, attributes)

  // This allows us to remove this abort function from the stack trace.
  // This means that your stack trace will be useful and point to the place
  // where the error is possibly thrown and _not_ to this function!
  if (Error.captureStackTrace) Error.captureStackTrace(error, abort)

  throw error
}
