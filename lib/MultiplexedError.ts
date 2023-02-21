/**
 * An error that combines many errors of the same type, separating
 * their error messages by a specified separator.
 */
export class MultiplexedError<T extends Error> extends Error {
  readonly errors: T[]

  constructor (errors: T[], messageSeparator: string = "\n") {
    super(errors.map((e) => e.message).join(messageSeparator))
    this.errors = errors
  }
}
