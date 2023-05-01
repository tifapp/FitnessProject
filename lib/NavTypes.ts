import { createStackNavigator } from "@react-navigation/stack"

export type StackNavigatorType<
  ParamsList extends Record<string, object | undefined>
> = ReturnType<typeof createStackNavigator<ParamsList>>
