import React from "react"
import { StackNavigatorType } from "@lib/NavTypes"
import {
  ReportingReason,
  ReportableContentType,
  reportContent
} from "@lib/Reporting"
import { ReportSuccessView } from "./SuccessView"
import { StackScreenProps } from "@react-navigation/stack"
import { StringUtils } from "@lib/String"
import { ReportFormView } from "./FormView"

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

export const createContentReportingStackScreens = <
  T extends ReportingScreensParamsList
>(
    stack: StackNavigatorType<T>,
    onReported: (
    contentId: string,
    contentType: ReportableContentType,
    reason: ReportingReason
  ) => Promise<void> = reportContent
  ) => {
  return (
    <>
      <stack.Screen
        name="reportSuccess"
        component={ReportSuccessScreen}
        options={({ route }: ReportSuccessScreenProps) => ({
          title: `Report ${titleFromContentType(route.params.contentType)}`
        })}
      />
      <stack.Screen
        name="reportContent"
        options={({ route }: ReportingScreenStackProps) => ({
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
