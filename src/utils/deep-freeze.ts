export function deepFreeze(object: any) {
  Object.freeze(object)

  for (let prop of Object.getOwnPropertyNames(object)) {
    if (
      object.hasOwnProperty(prop) &&
      object[prop] !== null &&
      (typeof object[prop] === 'object' ||
        typeof object[prop] === 'function') &&
      !Object.isFrozen(object[prop])
    ) {
      deepFreeze(object[prop])
    }
  }

  return object
}
