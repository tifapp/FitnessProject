package com.tifapp.tifnative

import android.annotation.SuppressLint
import android.annotation.TargetApi
import android.content.Context
import android.content.Context.*
import android.media.MediaPlayer
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.support.v4.content.ContextCompat.getSystemService
import kotlinx.coroutines.delay
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlin.math.ceil
import kotlin.math.max

@SuppressLint("InlinedApi")
@TargetApi(26)
public class AndroidHapticsPlayer(
    context: Context
) : HapticsPlayer {
    private var settings =
        HapticsSettings(isHapticFeedbackMuted = false, isHapticSoundEffectsMuted = false)
    private val mutex = Mutex()
    private var mPlayer = MediaPlayer()
    private val vibrator = context.defaultVibrator

    override suspend fun playSound(element: HapticPatternElement.AudioCustom) {
        mutex.withLock {
            if (settings.isHapticSoundEffectsMuted) {
                return
            }
            mPlayer.reset()
            mPlayer.apply {
                setDataSource(element.waveformPath)
                setVolume(element.volume.toFloat(), element.volume.toFloat())
                prepare()
                start()
            }
        }

    }

    public override suspend fun playEffect(effect: HapticPatternElement) {
        mutex.withLock {
            if (settings.isHapticFeedbackMuted) {
                return@playEffect
            }
        }
        when (effect) {
            is HapticPatternElement.AudioCustom -> playSound(effect)
            is HapticPatternElement.TransientEvent -> {
                delay(time(effect.time))
                vibrator.vibrate(
                    VibrationEffect.createOneShot(100, intensity(effect.intensity))
                )
            }
            is HapticPatternElement.ContinuousEvent -> {
                delay(time(effect.time))
                vibrator.vibrate(
                    VibrationEffect.createWaveform(
                        longArrayOf(0, time(effect.duration)),
                        intArrayOf(intensity(effect.intensity), intensity(effect.intensity)),
                        -1
                    )
                )
            }
        }
    }

    suspend fun playHapticPattern(ahapPattern: ExpoObject) {
        val readablePattern = createReadablePattern(ahapPattern)
        readablePattern.events.forEach { patternElement ->
            playEffect(patternElement)
        }
    }

    suspend fun apply(settings: ExpoObject) {
        val feedbackEnabled = settings["isHapticFeedbackEnabled"] as Boolean
        val soundEnabled = settings["isHapticAudioEnabled"] as Boolean
        val hapticsSettings = HapticsSettings(!feedbackEnabled, !soundEnabled)
        mutex.withLock {
            this.settings = hapticsSettings
        }
    }
}

data class HapticsSettings(
    var isHapticFeedbackMuted: Boolean,
    var isHapticSoundEffectsMuted: Boolean
)

private fun time(base: Double): Long = (base * 1000).toLong()
private fun intensity(base: Double): Int = max(1.0, ceil(255 * base)).toInt()