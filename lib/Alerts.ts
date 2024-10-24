import { Alert as RNAlert, AlertButton as RNAlertButton } from "react-native"

export type Alert = {
  title: string
  description?: string
  buttons?: AlertButton[]
}

export type AlertsObject = Record<string, Alert | ((...args: any) => Alert)>

export type AlertButton = RNAlertButton

export const presentAlert = (alert: Alert) => {
  RNAlert.alert(alert.title, alert.description, alert.buttons)
}
