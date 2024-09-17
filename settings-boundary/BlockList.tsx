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
import { memo, useCallback, useMemo, useState } from "react"
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
import { BoldFootnote, Headline } from "@components/Text"
import { TiFFormSectionView } from "@components/form-components/Section"
import { PrimaryButton } from "@components/Buttons"
import { TiFDefaultLayoutTransition } from "@lib/Reanimated"
import { TiFFormCardView } from "@components/form-components/Card"
import { TextToastView } from "@components/common/Toasts"
import ProfileImageAndName from "@components/profileImageComponents/ProfileImageAndName"
import { Ionicon } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import { useLastDefinedValue } from "@lib/utils/UseLastDefinedValue"

export type UseBlockListSettingsEnvironment = {
  nextPage: (token: string | null) => Promise<BlockListPage>
  unblockUser: (id: UserID) => Promise<void>
}

export const BLOCK_LIST_SETTINGS_ALERTS = {
  unblockUserConfirmation: {
    title: (username: string) => `Unblock ${username}?`,
    description: (
      user: Pick<BlockListUser, "username" | "handle">
    ) => `Are you sure you want to unblock ${user.username} (${user.handle})? You will need to wait 48 hours to block them again.

    They will be able to view your profile and see your activity, including the events you attend.

    You can continue to report them for any inappropriate behavior.`,
    buttons: (cancel: () => void, unblock: () => void) => [
      {
        text: "Cancel",
        style: "cancel" as const,
        onPress: cancel
      },
      {
        text: "Confirm",
        onPress: unblock
      }
    ]
  },
  unblockUserFailed: {
    title: "Uh Oh!",
    description: "Unable to unblock user. Please try again later."
  }
}

const BLOCK_LIST_QUERY_KEY = ["block-list"]

export const useBlockListSettings = (env: UseBlockListSettingsEnvironment) => ({
  ...useBlockListSettingsUsers(env),
  ...useBlocklistSettingsUnblocking(env)
})

const useBlockListSettingsUsers = ({
  nextPage
}: Pick<UseBlockListSettingsEnvironment, "nextPage">) => {
  const query = useInfiniteQuery(
    BLOCK_LIST_QUERY_KEY,
    async ({ pageParam }) => await nextPage(pageParam),
    { getNextPageParam: (page) => page.nextPageToken }
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
  unblockUser
}: Pick<UseBlockListSettingsEnvironment, "unblockUser">) => {
  const [activeUnblockingIds, setActiveUnblockingIds] = useState<UserID[]>([])
  const [mostRecentUnblockedUser, setMostRecentUnblockedUser] = useState<
    BlockListUser | undefined
  >()
  const [isShowingErrorAlert, setIsShowingErrorAlert] = useState(false)
  const queryClient = useQueryClient()
  const { mutate: unblock } = useMutation(
    async (user: BlockListUser) => await unblockUser(user.id),
    {
      onSuccess: (_, user) => {
        setMostRecentUnblockedUser(user)
        updateBlockListQueryUserPages(queryClient, (pages) => {
          return removeUsersFromBlockListPages(pages, [user.id])
        })
      },
      onError: () => {
        if (isShowingErrorAlert) return
        setIsShowingErrorAlert(true)
        Alert.alert(
          BLOCK_LIST_SETTINGS_ALERTS.unblockUserFailed.title,
          BLOCK_LIST_SETTINGS_ALERTS.unblockUserFailed.description,
          [{ text: "Ok", onPress: () => setIsShowingErrorAlert(false) }]
        )
      },
      onSettled: (_, __, user) => {
        setActiveUnblockingIds((activeIds) => {
          return activeIds.filter((id) => id !== user.id)
        })
      }
    }
  )
  return {
    activeUnblockingIds,
    mostRecentUnblockedUser,
    userUnblocked: useCallback(
      (user: BlockListUser) => {
        setMostRecentUnblockedUser(undefined)
        setActiveUnblockingIds((ids) => [...ids, user.id])
        Alert.alert(
          BLOCK_LIST_SETTINGS_ALERTS.unblockUserConfirmation.title(
            user.username
          ),
          BLOCK_LIST_SETTINGS_ALERTS.unblockUserConfirmation.description(user),
          BLOCK_LIST_SETTINGS_ALERTS.unblockUserConfirmation.buttons(
            () => {
              setActiveUnblockingIds((ids) => {
                return ids.filter((id) => id !== user.id)
              })
            },
            () => unblock(user)
          )
        )
      },
      [unblock]
    )
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
      removeClippedSubviews
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
        <TiFFormSectionView
          title="Blocked Users"
          subtitle="Listed below are the users that you have blocked. You can choose to unblock them or view their profile."
          style={styles.section}
        />
      }
      ListHeaderComponentStyle={styles.container}
      ListEmptyComponent={
        <View style={styles.noItems}>
          {state.status === "success" ||
            (state.status === "refreshing" && (
              <Headline>No users have been blocked.</Headline>
            ))}
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
      isVisible={!!state.mostRecentUnblockedUser}
      text={`Unblocked ${useLastDefinedValue(state.mostRecentUnblockedUser?.username)}!`}
    />
  </>
)

type BlockListUserProps = {
  user: BlockListUser
  isActivelyBeingBlocked: boolean
  onProfileTapped: (id: UserID) => void
  onUnblockTapped: (user: BlockListUser) => void
}

const BlockListUserView = memo(function BlockListUserView({
  user,
  isActivelyBeingBlocked,
  onUnblockTapped,
  onProfileTapped
}: BlockListUserProps) {
  return (
    <Animated.View
      entering={Platform.OS === "ios" ? FadeIn : undefined}
      exiting={Platform.OS === "ios" ? FadeOut : undefined}
      style={styles.container}
    >
      <TiFFormCardView>
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
            onPress={() => onUnblockTapped(user)}
            disabled={isActivelyBeingBlocked}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
            style={{ opacity: isActivelyBeingBlocked ? 0.5 : 1 }}
          >
            <View style={styles.unblockButton}>
              <Ionicon
                name="trash"
                size={16}
                color={AppStyles.red.toString()}
              />
              <BoldFootnote style={styles.unblockText}>Unblock</BoldFootnote>
            </View>
          </TouchableOpacity>
        </View>
      </TiFFormCardView>
    </Animated.View>
  )
})

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
