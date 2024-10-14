import { ComponentStory } from "@storybook/react-native"
import { StoryMeta } from "../HelperTypes"
import Game from "./Game"

const GameMeta: StoryMeta = {
  title: "Game"
}

export default GameMeta

type GameStory = ComponentStory<typeof Game>

export const Basic: GameStory = () => (
  <Game />
)
