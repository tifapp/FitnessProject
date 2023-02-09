import API, { GraphQLQuery } from "@aws-amplify/api"
import ListGroupItem from "@components/ListGroupItem"
import { listGroups } from "@graphql/queries"
import { useNavigation } from "@react-navigation/native"
import { graphqlOperation } from "aws-amplify"
import React, { useEffect, useState } from "react"
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native"
import { Group } from "src/models"

export default function MyGroups () {
  const { navigate } = useNavigation()
  const [groups, setGroups] = useState<[Group]>()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
  }, [])
  // const stateRef = useRef();
  // const [query, setQuery] = useState("");
  // console.log(id);

  const showResultsAsync = async () => {
    try {
      const namematchresult = await API.graphql<GraphQLQuery<{listGroups: {items: [Group]}}>>(
        graphqlOperation(listGroups, {
          filter: {
            userID: {
              eq: globalThis.myId
            }
          }
        })
      )
      setGroups(namematchresult.data?.listGroups.items)
    } catch (err) {
      console.log("error: ", err)
    }
    setRefreshing(false)
  }

  useEffect(() => {
    showResultsAsync()
  })

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>My Groups</Text>
      </View>
      <View>
        <FlatList
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          data={groups}
          renderItem={({ item }) => <ListGroupItem item={item} />}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton]}
        onPress={() => navigate("Create Group")}
      >
        <Text style={styles.buttonTextStyle}>Create Group</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    height: 80,
    paddingTop: 25,
    backgroundColor: "coral",
    borderRadius: 5,
    marginHorizontal: 10,
    marginTop: 10
  },
  title: {
    textAlign: "center",
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold"
  },
  submitButton: {
    marginTop: 20,
    alignSelf: "center",
    backgroundColor: "orange",
    padding: 10,
    borderRadius: 5
  },
  buttonTextStyle: {
    color: "white",
    alignSelf: "center",
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 2,
    marginHorizontal: 6
  }
})
