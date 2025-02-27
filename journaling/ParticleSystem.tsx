import { SkColor, SkPoint } from "@shopify/react-native-skia"
import { Tagged } from "TiFShared/lib/Types/HelperTypes"

export type ParticleSpawnBox = { type: "circular"; radius: number }

export enum ParticleSpawnOccasion {
  onBirth = 0,
  onDeath = 1,
  onUpdate = 2
}

export type ParticleID = Tagged<number, "_particleId">

export type ParticleColorMode = { type: "single"; color: string }

export type Particle = {
  /**
   * The unique ID of this particle.
   */
  id: ParticleID

  /**
   * The position of this particle.
   */
  position: SkPoint

  /**
   * The speed of this particle.
   */
  speed: SkPoint

  /**
   * The time this particle was created at.
   */
  birthTime: number

  /**
   * How long this particle should live for, measured in seconds.
   */
  lifespanSeconds: number

  /**
   * The initial size this particle was created at.
   */
  initialSize: number

  /**
   * The current size of this particle. This is recomputed every time its system's
   * `update()` method is called.
   */
  currentSize: number

  /**
   * The rotation angle of this particle.
   */
  rotationAngle: SkPoint

  /**
   * How fast this particle is spinning.
   */
  angularSpeed: SkPoint

  /**
   * The colors to use for rendering this particle over time.
   */
  colors: SkColor[]

  /**
   * The current color to use for rendering this particle right now. This is recomputed
   * every time its system's `update()` method is called.
   */
  currentColor: SkColor
}

export class ParticleSystem {}
