import APIList, { APIListRefType } from "@components/APIList"
import { ProfileImageAndName } from "@components/ProfileImageAndName"
import { listUsers } from "@graphql/queries"
import React, { useEffect, useRef } from "react"
import { View } from "react-native"
import { User } from "src/models"

interface Props {
  onAdd: (s : string) => void,
  query: string
}

function titleCase (str: string) {
  const splitStr = str.toLowerCase().split(" ")
  for (let i = 0; i < splitStr.length; i++) {
    // You do not need to check if i is larger than splitStr length, as your for does that for you
    // Assign it back to the array
    splitStr[i] =
      splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1)
  }
  // Directly return the joined string
  return splitStr.join(" ")
}

export default function UserTagInput ({
  onAdd,
  query
} : Props) {
  // const [taggedUsers, setTaggedUsers] = useState([]); in the future access using a ref
  const UserListRef = useRef<APIListRefType<User>>(null)
  const currentQuery = useRef<string>()

  currentQuery.current = query.toLowerCase()

  useEffect(() => {
    if (query !== "") {
      UserListRef.current?.refresh(() => currentQuery.current !== query.toLowerCase() || query === "")
    } else {
      if (UserListRef) UserListRef.current?.replaceList([])
    }
  }, [query])

  return (
    // maybe we'll need a general search bar component at some point. or add it to apilist/wrap it
    <View style={{ backgroundColor: "#a9efe0" }}>
      <APIList
        ref={UserListRef}
        queryOperation={listUsers}
        filter={{
          filter: {
            or: [
              {
                name: {
                  beginsWith: currentQuery.current
                }
              },
              {
                status: {
                  beginsWith: titleCase(currentQuery.current) // statuses should really be stored as lowercase strings to make this easier, but no time for that rn
                }
              },
              {
                name: {
                  contains: " " + currentQuery.current
                }
              },
              {
                bio: {
                  contains: currentQuery.current
                }
              },
              {
                goals: {
                  contains: currentQuery.current
                }
              }
            ]
          }
        }}
        ignoreInitialLoad={true}
        initialAmount={10}
        additionalAmount={20}
        renderItem={({ item }) => (
          <ProfileImageAndName
            onPress={() => {
              onAdd(item.id)
              console.log(item.id)
            }}
            style={{
              alignContent: "flex-start",
              alignItems: "center",
              alignSelf: "flex-start",
              justifyContent: "flex-start",
              flexDirection: "row",
              marginLeft: 15,
              marginRight: 5
            }}
            imageSize={20}
            userId={item.id}
          />
        )}
        keyExtractor={(item: User) => item.id}
      />
    </View>
  )
}
