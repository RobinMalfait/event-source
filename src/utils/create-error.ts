export function createError<T>(message: string, attributes?: T) {
  let error = Object.assign(new Error(message), attributes);

  // This allows us to remove this createError function from the stack trace.
  // This means that your stack trace will be useful and point to the place
  // where the error is possibly thrown and _not_ to this function!
  if (Error.captureStackTrace) Error.captureStackTrace(error, createError);

  return error;
}
