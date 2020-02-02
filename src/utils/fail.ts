import { createError } from './createError';

export function fail<T>(message: string, attributes?: T) {
  throw createError(message, attributes);
}
