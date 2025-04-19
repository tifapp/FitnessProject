import { useCoreNavigation } from "@components/Navigation"
import { ProfileCircleView } from "@components/profileImageComponents/ProfileCircle"
import {
  BodyText,
  BoldFootnote,
  Caption,
  CaptionTitle,
  Footnote,
  Headline,
  Subtitle,
  Title
} from "@components/Text"
import { ClientSideEvent } from "@event/ClientSideEvent"
import { AppStyles } from "@lib/AppColorStyle"
import { FontScaleFactors } from "@lib/Fonts"
import { Pressable, StyleSheet, View } from "react-native"

const ATTENDEES_TEXT_SPACING = [4, -4, -8]

type TextComponent =
  | typeof BoldFootnote
  | typeof Caption
  | typeof Headline
  | typeof BodyText
  | typeof Footnote
  | typeof CaptionTitle
  | typeof Title
  | typeof Subtitle

/**
 * A view that displays a preview of the current attendees in the event.
 */
export const EventAttendeesPreview = ({
  event,
  attendeeSize = 32,
  maxAttendees = 3,
  TextVariant = BoldFootnote
}: {
  event: ClientSideEvent
  attendeeSize?: number
  maxAttendees?: number
  TextVariant?: TextComponent
}) => {
  const { pushAttendeesList } = useCoreNavigation()
  const previewedAttendees =
    event.previewAttendees?.slice(0, maxAttendees) ?? []
  const attendeeTextOffset =
    previewedAttendees.length *
    ATTENDEES_TEXT_SPACING[Math.max(0, previewedAttendees.length - 1)]

  return (
    <Pressable
      onPress={() => pushAttendeesList(event.id)}
      style={styles.leftRow}
    >
      <View style={styles.centeredRow}>
        {previewedAttendees.map((a, index) => (
          <ProfileCircleView
            key={a.id}
            imageURL={a.profileImageURL}
            name={a.name}
            maximumFontSizeMultiplier={FontScaleFactors.large}
            style={[
              styles.profileCircle,
              {
                width: attendeeSize,
                height: attendeeSize
              },
              {
                left: index * -(attendeeSize / 2)
              }
            ]}
          />
        ))}
        {event.attendeeCount > maxAttendees ? (
          <TextVariant
            maxFontSizeMultiplier={FontScaleFactors.large}
            style={{ left: attendeeTextOffset }}
          >
            + {event.attendeeCount - maxAttendees} Attending
          </TextVariant>
        ) : (
          <TextVariant
            maxFontSizeMultiplier={FontScaleFactors.large}
            style={{ left: attendeeTextOffset }}
          >
            Attending
          </TextVariant>
        )}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  border: {
    height: 1,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: AppStyles.cardColor
  },
  card: {
    borderWidth: 2,
    borderRadius: 32,
    borderColor: AppStyles.cardColor.toString(),
    overflow: "hidden"
  },
  container: {
    padding: 16,
    rowGap: 16
  },
  profileCircle: {
    // Base styles only - size is now controlled by props
  },
  centeredRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },
  header: {
    backgroundColor: AppStyles.primaryBlue.toString(),
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32
  },
  iconSpacing: {
    columnGap: 8
  },
  infoColumn: {
    rowGap: 8,
    flex: 1
  },
  detailsRow: {
    display: "flex",
    flexDirection: "row",
    columnGap: 32
  },
  row: {
    display: "flex",
    flexDirection: "row"
  },
  leftRow: {
    flex: 1
  },
  menu: {
    justifyContent: "center",
    opacity: 0.5
  },
  attendanceButton: {
    padding: 12
  },
  moreAttendeesText: {
    left: -24
  },
  ongoingRow: {
    display: "flex",
    flexDirection: "row"
  },
  ongoing: {
    overflow: "hidden"
  },
  ongoingText: {
    color: AppStyles.green.toString(),
    padding: 4
  },
  ongoingSpacer: {
    flex: 1
  }
})
