import { IoniconName } from "@components/common/Icons"

/**
 * An interface for describing how something can be formatted with respect to privacy.
 */
export interface PrivacyFormattable {
  get formattedForPrivacy(): string
}

/**
 * An interface for describing how something can be stringified in a pretty way.
 */
export interface PrettyFormattable {
  get prettyFormatted(): string
}

/**
 * An interface that requires a type to describe itself as a contact info type
 * (email/phone number/etc.) in a pretty way.
 */
export interface ContactInfoTypeFormattable {
  get formattedContactInfoType(): string
  get contactInfoTypeIconName(): IoniconName
}

export type ContactInfoFormattable = PrivacyFormattable &
  PrettyFormattable &
  ContactInfoTypeFormattable
