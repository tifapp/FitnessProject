export const randomBool = (falseChance: number = 0.5) => {
  return Math.random() > falseChance
}
