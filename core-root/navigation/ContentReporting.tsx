import React from "react"
import { ChevronBackButton, StackNavigatorType } from "@components/Navigation"
import { StackScreenProps } from "@react-navigation/stack"
import { StringUtils } from "@lib/utils/String"
import {
  ReportFormView,
  ReportSuccessView,
  ReportingReason,
  ReportableContentType
} from "@core-content-reporting"

export type ReportingScreensParamsList = {
  reportSuccess: { contentType: ReportableContentType }
  reportContent: { contentId: string; contentType: ReportableContentType }
}

type ReportSuccessScreenProps = StackScreenProps<
  ReportingScreensParamsList,
  "reportSuccess"
>

type ReportingScreenStackProps = StackScreenProps<
  ReportingScreensParamsList,
  "reportContent"
>

/**
 * Creates the reporing screens in a given stack navigator.
 *
 * ```tsx
 * type ParamsList = { screen1: { id: string } } & ReportingScreensParamsList
 *
 * const Stack = createStackNavigator<ParamsList>()
 *
 * const reportingScreens = createContentReportingScreens<ParamsList>(Stack)
 *
 * const Screen = () => {
 *   return (
 *     <Stack.Navigator>
 *       <Stack.Screen name="screen1" component={Screen1} />
 *       {reportingScreens}
 *     </Stack.Navigator>
 *   )
 * }
 * ```
 *
 * @param stack the stack navigator to add the reporting screens to.
 * @param onReported a function that runs when a piece of content is reported.
 */
export const createContentReportingScreens = <
  T extends ReportingScreensParamsList
>(
  stack: StackNavigatorType<T>,
  onReported: (
    contentId: string,
    contentType: ReportableContentType,
    reason: ReportingReason
  ) => Promise<void>
) => {
  return (
    <>
      <stack.Screen
        name="reportSuccess"
        component={ReportSuccessScreen}
        options={({ route }: ReportSuccessScreenProps) => ({
          headerLeft: () => <ChevronBackButton />,
          title: `Report ${titleFromContentType(route.params.contentType)}`
        })}
      />
      <stack.Screen
        name="reportContent"
        options={({ route }: ReportingScreenStackProps) => ({
          headerLeft: () => <ChevronBackButton />,
          title: `Report ${titleFromContentType(route.params.contentType)}`
        })}
      >
        {(props: ReportingScreenStackProps) => (
          <ReportingScreen {...props} onReported={onReported} />
        )}
      </stack.Screen>
    </>
  )
}

const titleFromContentType = (contentType: ReportableContentType) => {
  return StringUtils.capitalizeFirstLetter(contentType)
}

type ReportContentScreenProps = {
  onReported: (
    contentId: string,
    contentType: ReportableContentType,
    reason: ReportingReason
  ) => Promise<void>
} & StackScreenProps<ReportingScreensParamsList, "reportContent">

const ReportingScreen = ({
  route,
  navigation,
  onReported
}: ReportContentScreenProps) => {
  const { contentId, contentType } = route.params
  return (
    <ReportFormView
      contentType={contentType}
      onSubmitted={async (reason) => {
        await onReported(contentId, contentType, reason)
        navigation.replace("reportSuccess", { contentType })
      }}
    />
  )
}

const ReportSuccessScreen = ({ navigation }: ReportSuccessScreenProps) => {
  return <ReportSuccessView onDoneTapped={() => navigation.goBack()} />
}
