export type CommandType<T> = { type: string; payload: T };

export function Command<T>(type: string, payload: T): CommandType<T> {
  return { type, payload };
}
