import { StyleSheet, View } from "react-native"
import { Position } from "./Types"

export class Player {
  private position: Position
  private width: number
  private screenWidth: number

  /**
   * Creates an instance of Player.
   * @param initialX - The initial X position of the player.
   * @param initialY - The initial Y position of the player.
   * @param width - The width of the player.
   * @param screenWidth - The width of the screen.
   */
  constructor(initialX: number, initialY: number, width: number, screenWidth: number) {
    this.position = { x: initialX, y: initialY }
    this.width = width
    this.screenWidth = screenWidth
  }

  /**
   * Gets the current position of the player.
   * @returns The current position as a Position object.
   */
  public getPosition(): Position {
    return this.position
  }

  /**
   * Moves the player left or right.
   * @param direction - The direction to move the player. Use `true` for right and `false` for left.
   */
  public movePlayer(direction: boolean): void {
    let newX: number = this.position.x + (direction ? 1 : -1) * 20

    // Ensure the player doesn't move off the screen to the left
    if (newX < 0) {
      newX = 0
    }

    // Ensure the player doesn't move off the screen to the right
    if (newX > this.screenWidth - this.width) {
      newX = this.screenWidth - this.width
    }

    this.position.x = newX
  }

  /**
   * Resets the player's position to the initial coordinates.
   * @param initialX - The initial X position to reset to.
   * @param initialY - The initial Y position to reset to.
   */
  public reset(initialX: number, initialY: number): void {
    this.position.x = initialX
    this.position.y = initialY
  }

  public render() {
    return <View style={[styles.player, { left: this?.position?.x ?? 0, top: this?.position?.y ?? 0 }]} />
  }
}

const styles = StyleSheet.create({
  player: {
    position: "absolute",
    width: 50,
    height: 50,
    backgroundColor: "white"
  }
})
