declare module 'yamlify-object' {
  export default function<T extends Object>(
    input: T,
    options: Partial<{
      indent: string
      prefix: string
      postfix: string
      dateToString(date: Date): string
      errorToString(error: Error): string
      colors: Partial<{
        date(input: string): string
        error(input: string): string
        symbol(input: string): string
        string(input: string): string
        number(input: string): string
        boolean(input: string): string
        null(input: string): string
        undefined(input: string): string
      }>
    }>
  ): string
}

declare module 'crypto' {
  export function randomUUID(): string
}
