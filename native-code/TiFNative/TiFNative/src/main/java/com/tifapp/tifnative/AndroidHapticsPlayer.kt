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
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

@SuppressLint("InlinedApi")
@TargetApi(26)
public class AndroidHapticsPlayer(
    private val context: Context
) : HapticsPlayer {
    private var settings =
        HapticsSettings(isHapticFeedbackMuted = false, isHapticSoundEffectsMuted = false)
    private val mutex = Mutex()
    private var mPlayer = MediaPlayer()
    private val vibrator: Vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        (context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager).defaultVibrator
    } else {
        @Suppress("DEPRECATION")
        context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
    }

    override suspend fun playSound(element: HapticPatternElement.AudioCustom) {
        if (settings.isHapticSoundEffectsMuted) {
            return
        }
        mutex.withLock {
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
        if (settings.isHapticFeedbackMuted) {
            return
        }
        mutex.withLock {
            when (effect) {
                is HapticPatternElement.AudioCustom -> playSound(effect)
                is HapticPatternElement.TransientEvent -> vibrator.vibrate(
                    VibrationEffect.createOneShot(
                        effect.time.toLong(),
                        effect.intensity.toInt()
                    )
                )

                is HapticPatternElement.ContinuousEvent -> vibrator.vibrate(
                    VibrationEffect.createWaveform(
                        longArrayOf(
                            0,
                            effect.duration.toLong()
                        ), intArrayOf(effect.intensity.toInt(), effect.intensity.toInt()), -1
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
        val feedbackMuted = settings["isHapticFeedbackMuted"] as Boolean
        val soundMuted = settings["isHapticsSoundEffectsMuted"] as Boolean
        val hapticsSettings = HapticsSettings(feedbackMuted, soundMuted)
        mutex.withLock {
            this.settings = hapticsSettings
        }
    }
}

data class HapticsSettings(
    var isHapticFeedbackMuted: Boolean,
    var isHapticSoundEffectsMuted: Boolean
)