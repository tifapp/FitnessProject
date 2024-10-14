/**
 * An interface for describing how something can be formatted with respect to privacy.
 */
export interface PrivacyFormattable {
  get formattedForPrivacy(): string
}
