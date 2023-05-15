export type PayloadOf<
  T extends (...args: any) => { payload: unknown }
> = ReturnType<T>['payload']

export type TypeOf<T extends (...args: any) => { type: unknown }> = ReturnType<
  T
>['type']
