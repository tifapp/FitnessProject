import BlockedUsersListView from "@screens/BlockedUsersList/BlockedUsersListView"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"

const BlockedUsersListMeta: ComponentMeta<typeof BlockedUsersListView> = {
  title: "Blocked Users List",
  component: BlockedUsersListView
}
export default BlockedUsersListMeta

type BlockedUsersListViewStory = ComponentStory<typeof BlockedUsersListView>

export const Basic: BlockedUsersListViewStory = () => <BlockedUsersListView />
