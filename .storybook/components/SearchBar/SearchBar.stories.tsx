import { SearchBar } from "@components/SearchBar"
import { useState } from "react"
import { MaterialIcon } from "@components/common/Icons"
import { StoryMeta } from ".storybook/HelperTypes"

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

const SearchBarMeta: StoryMeta = {
  title: "SearchBar"
}

export default SearchBarMeta

export const Default = () => <PreviewSearchBar />
