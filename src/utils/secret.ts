const instances = new WeakMap();

/**
 * This code allows us to store secret/private values for objects. In JavaScript
 * you can't really store secrets on an object. There is this convention with
 * for naming a variable `this._somePrivateField` but that is still accessible.
 *
 * Another trick you can use is to use symbols, but if you get access to the
 * symbol, you can still retrieve the data.
 *
 * This approach uses a WeakMap. The WeakMap has a key which should be an
 * object, so that you can store avlues specifically for this reference.
 */

export function set<T>(key: object, data: T): void {
  if (instances.has(key)) {
    const original = instances.get(key);

    instances.set(key, { ...original, ...data });
  } else {
    instances.set(key, data);
  }
}

export function get<T>(key: object): T {
  return instances.get(key);
}
