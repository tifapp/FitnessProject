import { SkSize, AnimatedProp, Group } from "@shopify/react-native-skia"
import { FixedDateRange } from "TiFShared/domain-models/FixedDateRange"
import { EdgeInsets } from "react-native-safe-area-context"
import { MountainDrawing } from "./Mountain"
import { PragmaDrawing, PragmaPose } from "./Pragma"
import { StarrySkyDrawing } from "./StarrySky"
import { SunDrawing, SunSkyDrawing } from "./SunBackground"
import { MoonDrawing } from "./MoonBackground"
import { useMemo } from "react"

export type MountainTopIntroProps = {
  theme: "sun" | "moon"
  size: SkSize
  pragmaPose: PragmaPose
  dayRange: FixedDateRange
  time: number
  edgeInsets: EdgeInsets
  opacity: AnimatedProp<number>
  includeThemeObject?: boolean
}

const PRAGMA_DIMENSIONS = {
  width: 384,
  height: 384
}

const POSE_OFFSETS = {
  normal: { x: 240, y: 160 },
  worship: { x: 198, y: 198 },
  standing: { x: 198, y: 256 }
} as const

export const MountainTopIntroDrawing = ({
  theme,
  size,
  time,
  pragmaPose,
  edgeInsets,
  dayRange,
  opacity,
  includeThemeObject = false
}: MountainTopIntroProps) => {
  const background = useMemo(
    () => ({ time, dayRange, clouds: [] }),
    [time, dayRange]
  )
  return (
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
      {includeThemeObject && theme === "moon" && (
        <MoonDrawing
          background={background}
          size={size}
          edgeInsets={edgeInsets}
        />
      )}
      {includeThemeObject && theme === "sun" && (
        <SunDrawing
          background={background}
          size={size}
          edgeInsets={edgeInsets}
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
        x={size.width / 2 - POSE_OFFSETS[pragmaPose].x}
        y={size.height / 2 - POSE_OFFSETS[pragmaPose].y}
      />
    </Group>
  )
}
