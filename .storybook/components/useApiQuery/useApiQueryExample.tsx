import { useApiQuery } from "@hooks/useApiQuery"
import { Button, Text, View } from "react-native"
import { QueryClient, QueryClientProvider } from "react-query"

const queryClient = new QueryClient()

const QueryDisplay = () => {
  const query = useApiQuery("/user", "GET", { payload: 0 })

  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Button
        title={"Test /user Query"}
        onPress={() => {
          query.refetch()
        }}
      />
      <Text>{JSON.stringify(query.data, null, 4)}</Text>
    </View>
  )
}

export const ExampleQuery = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <QueryDisplay />
    </QueryClientProvider>
  )
}
