import {
  InfiniteData,
  QueryClient,
  useInfiniteQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query"
import { UserID } from "TiFShared/domain-models/User"
import {
  BlockListPage,
  BlockListUser,
  removeUsersFromBlockListPages
} from "TiFShared/domain-models/BlockList"
import { useMemo, useRef, useState } from "react"
import {
  StyleProp,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  ViewStyle,
  StyleSheet,
  Alert,
  View,
  FlatList,
  Platform,
  TouchableOpacity
} from "react-native"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"
import { Headline } from "@components/Text"
import { SettingsSectionView } from "./components/Section"
import { PrimaryButton } from "@components/Buttons"
import { TiFDefaultLayoutTransition } from "@lib/Reanimated"
import { SettingsCardView } from "./components/Card"
import { TextToastView } from "@components/common/Toasts"
import ProfileImageAndName from "@components/profileImageComponents/ProfileImageAndName"
import { Ionicon } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"

export type BlockListUnblockSuccessBannerID = "single-user" | "multiple-users"

export type UseBlockListSettingsEnvironment = {
  nextPage: (token: string | null) => Promise<BlockListPage>
  unblockUsers: (ids: UserID[]) => Promise<void>
  unblockDebounceMillis: number
}

export const BLOCK_LIST_SETTINGS_ALERTS = {
  unblockUserFailed: {
    title: "Uh Oh!",
    description: (userCount: number) => {
      return `Unable to unblock ${userCount > 1 ? "users" : "user"}. Please try again later.`
    }
  }
}

const BLOCK_LIST_QUERY_KEY = ["block-list"]

export const useBlockListSettings = (env: UseBlockListSettingsEnvironment) => {
  const unblocking = useBlocklistSettingsUnblocking(env)
  return {
    ...useBlockListSettingsUsers(unblocking.activeUnblockingIds, env),
    ...unblocking
  }
}

const useBlockListSettingsUsers = (
  activeUnblockingIds: UserID[],
  { nextPage }: Pick<UseBlockListSettingsEnvironment, "nextPage">
) => {
  const query = useInfiniteQuery(
    BLOCK_LIST_QUERY_KEY,
    async ({ pageParam }) => await nextPage(pageParam),
    {
      getNextPageParam: (page) => page.nextPageToken,
      select: (data) => ({
        ...data,
        pages: removeUsersFromBlockListPages(data.pages, activeUnblockingIds)
      })
    }
  )
  return {
    get status() {
      if (query.isRefetching) return "refreshing"
      return query.isFetching ? "loading" : query.status
    },
    isRefreshing: query.isRefetching,
    users: useMemo(
      () => query.data?.pages.flatMap((p) => p.users) ?? [],
      [query.data]
    ),
    refreshed: () => {
      query.refetch()
    },
    nextPageRequested: query.hasNextPage
      ? () => {
          query.fetchNextPage()
        }
      : undefined
  }
}

const updateBlockListQueryUserPages = (
  queryClient: QueryClient,
  update: (pages: BlockListPage[]) => BlockListPage[]
) => {
  queryClient.setQueryData(
    BLOCK_LIST_QUERY_KEY,
    (data: InfiniteData<BlockListPage> | undefined) => {
      if (!data) return undefined
      return { ...data, pages: update(data.pages) }
    }
  )
}

const useBlocklistSettingsUnblocking = ({
  unblockUsers,
  unblockDebounceMillis
}: Pick<
  UseBlockListSettingsEnvironment,
  "unblockUsers" | "unblockDebounceMillis"
>) => {
  const [activeUnblockingIds, setActiveUnblockingIds] = useState<UserID[]>([])
  const queryClient = useQueryClient()
  const unblockTimeoutRef = useRef<NodeJS.Timeout>()
  const unblockMutation = useMutation(unblockUsers, {
    onSuccess: (_, userIds) => {
      updateBlockListQueryUserPages(queryClient, (pages) => {
        return removeUsersFromBlockListPages(pages, userIds)
      })
    },
    onError: (_, userIds) => {
      Alert.alert(
        BLOCK_LIST_SETTINGS_ALERTS.unblockUserFailed.title,
        BLOCK_LIST_SETTINGS_ALERTS.unblockUserFailed.description(userIds.length)
      )
    },
    onSettled: () => setActiveUnblockingIds([])
  })
  return {
    activeUnblockingIds,
    get unblockSuccessBannerId(): BlockListUnblockSuccessBannerID | undefined {
      if (!unblockMutation.isSuccess) return undefined
      return (unblockMutation.variables?.length ?? 0) > 1
        ? "multiple-users"
        : "single-user"
    },
    disappeared: () => {
      if (activeUnblockingIds.length <= 0) return
      clearTimeout(unblockTimeoutRef.current)
      unblockMutation.mutate(activeUnblockingIds)
    },
    userUnblocked: (id: UserID) => {
      clearTimeout(unblockTimeoutRef.current)
      const newIds = [...activeUnblockingIds, id]
      setActiveUnblockingIds(newIds)
      unblockTimeoutRef.current = setTimeout(
        () => unblockMutation.mutate(newIds),
        unblockDebounceMillis
      )
    }
  }
}

export type BlockListSettingsProps = {
  state: ReturnType<typeof useBlockListSettings>
  onUserProfileTapped: (id: UserID) => void
  style?: StyleProp<ViewStyle>
}

const blockListUserKeyExtractor = (user: BlockListUser) => user.id

// NB: Animated.FlatList has a bug on android in where item removal animations
// cause glitches and inivisible elements in the list. For now, we'll disable
// animations on Android. More info:
// https://github.com/software-mansion/react-native-reanimated/issues/5728
const FlatListView = Platform.OS === "ios" ? Animated.FlatList : FlatList

export const BlockListSettingsView = ({
  state,
  onUserProfileTapped,
  style
}: BlockListSettingsProps) => (
  <>
    <FlatListView
      data={state.users}
      keyExtractor={blockListUserKeyExtractor}
      renderItem={({ item: user }: { item: BlockListUser }) => (
        <BlockListUserView
          user={user}
          isActivelyBeingBlocked={state.activeUnblockingIds.includes(user.id)}
          onProfileTapped={onUserProfileTapped}
          onUnblockTapped={state.userUnblocked}
        />
      )}
      ListHeaderComponent={
        <SettingsSectionView
          title="Blocked Users"
          subtitle="Listed below are the users that you have blocked. You can choose to unblock them or view their profile."
          style={styles.section}
        />
      }
      ListHeaderComponentStyle={styles.container}
      ListEmptyComponent={
        <View style={styles.noItems}>
          {(state.status === "success" || state.status === "refreshing") && (
            <Headline>No users have been blocked.</Headline>
          )}
          {state.status === "loading" && (
            <ActivityIndicator style={styles.loadingIndicator} />
          )}
          {state.status === "error" && (
            <PrimaryButton onPress={state.refreshed}>Retry</PrimaryButton>
          )}
        </View>
      }
      ListFooterComponent={
        <>
          {state.status === "loading" && state.users.length > 0 && (
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <ActivityIndicator style={styles.loadingIndicator} />
            </Animated.View>
          )}
        </>
      }
      ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      itemLayoutAnimation={TiFDefaultLayoutTransition}
      refreshControl={
        <RefreshControl
          refreshing={state.isRefreshing}
          onRefresh={state.refreshed}
        />
      }
      onEndReached={state.nextPageRequested}
      onEndReachedThreshold={0.8}
      contentContainerStyle={styles.listContent}
      style={[style, styles.list]}
    />
    <TextToastView
      isVisible={state.unblockSuccessBannerId === "single-user"}
      text="Successfully Unblocked User!"
    />
    <TextToastView
      isVisible={state.unblockSuccessBannerId === "multiple-users"}
      text="Successfully Unblocked Users!"
    />
  </>
)

type BlockListUserProps = {
  user: BlockListUser
  isActivelyBeingBlocked: boolean
  onProfileTapped: (id: UserID) => void
  onUnblockTapped: (id: UserID) => void
}

const BlockListUserView = ({
  user,
  isActivelyBeingBlocked,
  onUnblockTapped,
  onProfileTapped
}: BlockListUserProps) => (
  <Animated.View
    entering={Platform.OS === "ios" ? FadeIn : undefined}
    exiting={Platform.OS === "ios" ? FadeOut : undefined}
    style={styles.container}
  >
    <SettingsCardView>
      <View style={styles.userContainer}>
        <View style={styles.profileAndName}>
          <Pressable onPress={() => onProfileTapped(user.id)}>
            <ProfileImageAndName
              username={user.username}
              handle={user.handle}
              imageURL={user.profileImageURL}
            />
          </Pressable>
        </View>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => onUnblockTapped(user.id)}
          disabled={isActivelyBeingBlocked}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          style={{ opacity: isActivelyBeingBlocked ? 0.5 : 1 }}
        >
          <View style={styles.unblockButton}>
            <Ionicon name="trash" color={AppStyles.red.toString()} />
            <Headline style={styles.unblockText}>Unblock</Headline>
          </View>
        </TouchableOpacity>
      </View>
    </SettingsCardView>
  </Animated.View>
)

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24
  },
  section: {
    paddingBottom: 32
  },
  list: {
    height: "100%"
  },
  listContent: {
    flexGrow: 1
  },
  userContainer: {
    padding: 16,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: 8
  },
  profileAndName: {
    flex: 1
  },
  unblockButton: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    columnGap: 4
  },
  unblockText: {
    color: AppStyles.red.toString()
  },
  itemSeparator: {
    padding: 8
  },
  loadingIndicator: {
    padding: 16
  },
  noItems: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 24
  }
})
