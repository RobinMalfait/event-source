import { createError } from './create-error';

export function abort<T>(message: string, attributes?: T) {
  throw createError(message, attributes);
}
