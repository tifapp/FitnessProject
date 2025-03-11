import { SkSize, AnimatedProp, Group } from "@shopify/react-native-skia"
import { FixedDateRange } from "TiFShared/domain-models/FixedDateRange"
import { EdgeInsets } from "react-native-safe-area-context"
import { MountainDrawing } from "./Mountain"
import { PragmaDrawing, PragmaPose } from "./Pragma"
import { StarrySkyDrawing } from "./StarrySky"
import { SunSkyDrawing } from "./SunBackground"

export type MountainTopIntroProps = {
  theme: "sun" | "moon"
  size: SkSize
  pragmaPose: PragmaPose
  dayRange: FixedDateRange
  time: number
  edgeInsets: EdgeInsets
  opacity: AnimatedProp<number>
}

const PRAGMA_DIMENSIONS = {
  width: 384,
  height: 384
}

export const MountainTopIntroDrawing = ({
  theme,
  size,
  time,
  pragmaPose,
  edgeInsets,
  dayRange,
  opacity
}: MountainTopIntroProps) => (
  <Group opacity={opacity}>
    {theme === "moon" && <StarrySkyDrawing size={size} numStars={50} />}
    {theme === "sun" && (
      <SunSkyDrawing
        size={size}
        time={time}
        edgeInsets={edgeInsets}
        dayRange={dayRange}
      />
    )}
    <MountainDrawing
      size={size}
      mountainWidthRelativeOffset={0.4}
      colorSet={theme}
    />
    <PragmaDrawing
      size={PRAGMA_DIMENSIONS}
      pose={pragmaPose}
      x={size.width / 2 - 198}
      y={size.height / 2 - 198}
    />
  </Group>
)
