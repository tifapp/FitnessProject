import { Caption, Headline } from "@components/Text"
import { Ionicon, IoniconName } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import { ReactNode } from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"

export type SectionProps = {
  icon: IoniconName
  style: StyleProp<ViewStyle>
  addOn?: ReactNode
  caption?: string
  title: string
}

export const Section = ({
  icon,
  style,
  addOn,
  caption,
  title
}: SectionProps) => {
  return (
    <View style={[styles.paddingIconSection, style]}>
      <View style={styles.spacing}>
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <Ionicon
            style={[styles.iconStyling]}
            name={icon}
            color={AppStyles.darkColor}
          />
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <Headline
          style={[
            styles.textColor,
            {
              textAlignVertical: "center",
              textAlign: "left"
            }
          ]}
        >
          {title}
        </Headline>

        {caption && (
          <View style={{ marginTop: 4 }}>
            <Caption>{caption}</Caption>
          </View>
        )}
      </View>

      {addOn && (
        <View
          style={{
            marginRight: 8,
            alignItems: "flex-end",
            justifyContent: "flex-end"
          }}
        >
          {addOn}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  flexRow: {
    flex: 1,
    flexDirection: "row"
  },
  container: {
    marginTop: 24,
    backgroundColor: "white"
  },
  paddingIconSection: {
    display: "flex",
    paddingVertical: 8,
    alignItems: "center",
    width: "100%"
  },
  iconSection: {
    backgroundColor: "#F4F4F6",
    borderRadius: 8,
    paddingVertical: 4
  },
  iconStyling: {
    padding: 10
  },
  spacing: {
    paddingHorizontal: 10
  },
  captionLinks: {
    opacity: 1,
    fontWeight: "bold"
  },
  textColor: {
    color: AppStyles.darkColor
  }
})
