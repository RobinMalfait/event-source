import { createError } from './createError';

export function abort<T>(message: string, attributes?: T) {
  throw createError(message, attributes);
}
