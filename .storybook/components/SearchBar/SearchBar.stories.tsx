import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import { SearchBar } from "@components/SearchBar"
import { useState } from "react"
import { MaterialIcon } from "@components/common/Icons"

const PreviewSearchBar = () => {
  const [text, setText] = useState("")
  return (
    <SearchBar
      style={{ paddingHorizontal: 16, paddingVertical: 48 }}
      leftAddon={<MaterialIcon name="search" />}
      placeholder={"Search Something..."}
      text={text}
      onTextChanged={setText}
    />
  )
}

const SearchBarMeta: ComponentMeta<typeof PreviewSearchBar> = {
  title: "SearchBar",
  component: PreviewSearchBar
}

export default SearchBarMeta

type SearchBarStory = ComponentStory<typeof PreviewSearchBar>

export const Default: SearchBarStory = () => <PreviewSearchBar />
