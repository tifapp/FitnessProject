/**
 * Convert HSL to Hex color
 * @param h Hue (0-360)
 * @param s Saturation (0-100)
 * @param l Lightness (0-100)
 * @returns Hex color string (e.g. '#FF0000')
 */
export const HSLToHex = (h: number, s: number, l: number): string => {
  h = h % 360
  s = Math.max(0, Math.min(100, s)) / 100
  l = Math.max(0, Math.min(100, l)) / 100

  if (s === 0) {
    // Achromatic (gray)
    const grayValue = Math.round(l * 255)
    return `#${grayValue.toString(16).padStart(2, "0").repeat(3)}`
  }

  const hueTorgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const r = hueTorgb(p, q, h / 360 + 1 / 3)
  const g = hueTorgb(p, q, h / 360)
  const b = hueTorgb(p, q, h / 360 - 1 / 3)

  const toHex = (c: number): string => {
    const hex = Math.round(c * 255).toString(16)
    return hex.length === 1 ? "0" + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Generate a distinct color from an index
 * @param index The index to generate a color from
 * @returns A hex color string
 */
export const generateDistinctColor = (index: number): string => {
  // Use golden ratio to create well-distributed hues
  const goldenRatioConjugate = 0.618033988749895
  let hue = (index * goldenRatioConjugate) % 1

  // Convert to degrees
  hue *= 360

  // Use high saturation and medium-high lightness for vibrant colors
  return HSLToHex(hue, 85, 60)
}

/**
 * Generate a color palette with n distinct colors
 * @param n Number of colors in the palette
 * @returns Array of hex color strings
 */
export const generateColorPalette = (n: number): string[] => {
  return Array.from({ length: n }).map((_, index) =>
    generateDistinctColor(index)
  )
}

/**
 * Determine if a color is dark or light
 * @param hexColor Hex color string
 * @returns boolean - true if the color is dark, false if light
 */
export const isColorDark = (hexColor: string): boolean => {
  // Remove # if present
  const hex = hexColor.replace("#", "")

  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // Calculate luminance (perceived brightness)
  // Using the formula: 0.299*R + 0.587*G + 0.114*B
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // If luminance is less than 0.5, the color is considered dark
  return luminance < 0.5
}
