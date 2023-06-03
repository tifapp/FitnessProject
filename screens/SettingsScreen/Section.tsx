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
    <View
      style={[styles.paddingIconSection, style, { alignSelf: "flex-start" }]}
    >
      <View style={styles.spacing}>
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <Ionicon
            style={[styles.iconStyling]}
            name={icon}
            color={AppStyles.darkColor}
          />
        </View>
      </View>

      <View style={{ justifyContent: "center" }}>
        <Headline
          style={[
            styles.textColor,
            { textAlignVertical: "center", textAlign: "left" }
          ]}
        >
          {title}
        </Headline>

        {caption
          ? (
            <View style={{ flex: 1, flexDirection: "row", maxWidth: "80%" }}>
              <Caption style={[styles.textColor, { textAlign: "left" }]}>
                {caption}
              </Caption>
            </View>
          )
          : null}
      </View>

      {addOn
        ? (
          <View
            style={[
              styles.flexRow,
              { alignItems: "center", justifyContent: "flex-end" }
            ]}
          >
            {addOn}
          </View>
        )
        : null}
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
    paddingVertical: 8,
    alignItems: "center"
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
