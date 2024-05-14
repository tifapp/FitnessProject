import { IoniconName } from "@components/common/Icons"

/**
 * An interface for describing how something can be formatted with respect to privacy.
 */
export interface PrivacyFormattable {
  get formattedForPrivacy(): string
}

export interface PrettyFormattable {
  get prettyFormatted(): string
}

export interface ContactInfoTypeFormattable {
  get formattedContactInfoType(): string
  get contactInfoTypeIconName(): IoniconName
}

export type ContactInfoFormattable = PrivacyFormattable &
  PrettyFormattable &
  ContactInfoTypeFormattable
