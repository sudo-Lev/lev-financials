export type Result<Value, Error> =
  | Readonly<{ ok: true; value: Value }>
  | Readonly<{ error: Error; ok: false }>

export function success<Value>(value: Value): Result<Value, never> {
  return { ok: true, value }
}

export function failure<Error>(error: Error): Result<never, Error> {
  return { error, ok: false }
}
