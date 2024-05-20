import {
  InfiniteData,
  QueryClient,
  useInfiniteQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query"
import { UserHandle, UserID } from "TiFShared/domain-models/User"
import { useMemo, useRef, useState } from "react"
import { StyleProp, View, ViewStyle, Alert } from "react-native"

export type BlockListUser = {
  id: UserID
  username: string
  handle: UserHandle
  profileImageURL: string | null
}

export type BlockListPage = {
  users: BlockListUser[]
  nextPageToken: string | null
}

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
    status: query.isFetching ? "loading" : query.status,
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
        return pages.map((p) => ({
          ...p,
          users: p.users.filter((u) => !userIds.includes(u.id))
        }))
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
  style?: StyleProp<ViewStyle>
}

export const BlockListSettingsView = ({ style }: BlockListSettingsProps) => (
  <View />
)
