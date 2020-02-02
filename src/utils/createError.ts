export function createError<T>(message: string, attributes?: T) {
  return Object.assign(new Error(message), attributes);
}
