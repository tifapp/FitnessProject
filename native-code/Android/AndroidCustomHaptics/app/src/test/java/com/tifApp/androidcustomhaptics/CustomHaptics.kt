package com.example.androidcustomhaptics

import android.media.MediaPlayer
import android.os.VibrationEffect
import android.os.Vibrator

//Handles the structure of what each event requires, to be created into a HapticPatternElement

@Suppress ("UNCHECKED_CAST")
sealed class HapticPatternElement (open val time: Double) {
    data class TransientEvent(override var time: Double, var intensity: Double) :
        HapticPatternElement(time = time) {
        companion object {
            fun fromExpoObject(ahapPattern: ExpoObject): TransientEvent? {
                val time = ahapPattern["Time"] as? Double
                val intensityParameter =
                    (ahapPattern["EventParameters"] as? List<Map<String, Any?>>)?.find {
                        it["ParameterID"] == "HapticIntensity"
                    }
                val intensity = intensityParameter?.get("ParameterValue") as? Double
                return if (intensity != null && time != null) TransientEvent(
                    time,
                    intensity
                ) else null
            }
        }
    }

    data class ContinuousEvent(
        override var time: Double,
        var duration: Double,
        var intensity: Double
    ) :
        HapticPatternElement(time = time) {
        companion object {
            fun fromExpoObject(ahapPattern: ExpoObject): ContinuousEvent? {
                val time = ahapPattern["Time"] as? Double
                val duration = ahapPattern["EventDuration"] as? Double
                val intensityParameter =
                    (ahapPattern["EventParameters"] as? List<Map<String, Any?>>)?.find {
                        it["ParameterID"] == "HapticIntensity"
                    }
                val intensity = intensityParameter?.get("ParameterValue") as? Double
                return if (time != null && duration != null && intensity != null) ContinuousEvent(
                    time,
                    duration,
                    intensity
                ) else null
            }
        }
    }

    data class AudioCustom(
        override var time: Double,
        var waveformPath: String,
        var volume: Double
    ) :
        HapticPatternElement(time = time) {
        companion object {
            fun fromExpoObject(ahapPattern: ExpoObject): AudioCustom? {
                val time = ahapPattern["Time"] as? Double
                val waveformPath = ahapPattern["EventWaveformPath"] as? String
                val volumeParameter =
                    (ahapPattern["EventParameters"] as? List<Map<String, Any?>>)?.find {
                        it["ParameterID"] == "AudioVolume"
                    }
                val volume = volumeParameter?.get("ParameterValue") as? Double
                return if (time != null && waveformPath != null && volume != null) AudioCustom(
                    time,
                    waveformPath,
                    volume
                ) else null
            }
        }
    }
}

interface HapticsPlayer {
    suspend fun playSound(filepath: String)
    suspend fun playEffect(effect: HapticPatternElement)
}

//HapticPattern can be represented as a list of pattern elements, that get done in order
data class HapticPattern(val events: List<HapticPatternElement>)

@Suppress ("UNCHECKED_CAST")
fun createReadableEvent (givenEvent: Map<String, Any?>): HapticPatternElement? {
      val event = givenEvent["Event"] as Map<String, Any?>

      val eventType = event["EventType"] as? String

    return when (eventType){
        "AudioCustom" -> HapticPatternElement.AudioCustom.fromExpoObject(event)
        "HapticTransient" -> HapticPatternElement.TransientEvent.fromExpoObject(event)
        "HapticContinuous" -> HapticPatternElement.ContinuousEvent.fromExpoObject(event)
        else -> null
    }

}

@Suppress ("UNCHECKED_CAST")
fun createReadablePattern(givenPattern: Map<String, Any?>): HapticPattern {
    //Required for all:
    val initialPattern = givenPattern["Pattern"] as List<Map<String, Any?>>
    val readablePattern = mutableListOf<HapticPatternElement>()

    initialPattern.forEach { patternElement ->
        createReadableEvent(patternElement)?.let { readablePattern.add(it) }
    }
    readablePattern.sortBy { it.time }
    return HapticPattern(events = readablePattern)
}

public class HapticsPatternPlayer: HapticsPlayer {
    override suspend fun playSound(filepath: String) {
        var mediaPlayer: MediaPlayer?=null

        mediaPlayer = MediaPlayer()
        mediaPlayer.reset()
        mediaPlayer.apply {
            setDataSource(filepath)
            prepare()
            start()
        }
    }

    override suspend fun playEffect(effect: HapticPatternElement) {
        val vibrator: Vibrator?=null

        when (effect) {
             is HapticPatternElement.AudioCustom -> playSound(effect.waveformPath)
             is HapticPatternElement.TransientEvent -> vibrator?.vibrate(VibrationEffect.createOneShot(effect.time.toLong(),
                 effect.intensity.toInt()
             ))
             is HapticPatternElement.ContinuousEvent -> vibrator?.vibrate(VibrationEffect.createWaveform(longArrayOf(
                 0,
                 effect.duration.toLong()
             ), intArrayOf(effect.intensity.toInt(), effect.intensity.toInt()), -1))
         }
    }
    suspend fun playHapticPattern(ahapPattern: ExpoObject){
        val readablePattern = createReadablePattern(ahapPattern)
        readablePattern.events.forEach { patternElement ->
            playEffect(patternElement)
        }
    }
}


public class TestHapticsPatternPlayer : HapticsPlayer {
    private val playedEvents = mutableListOf<String>()
    override suspend fun playSound(filepath: String) {
        playedEvents.add("PlaySound called with $filepath .")
    }

    private fun testWithHapticsElementType (element: HapticPatternElement) {
        when (element){
            is HapticPatternElement.AudioCustom -> playedEvents.add("PlayEffect called at time ${element.time}, as AudioCustom")
            is HapticPatternElement.TransientEvent -> playedEvents.add("PlayEffect called at time ${element.time}, as TransientEvent")
            is HapticPatternElement.ContinuousEvent -> playedEvents.add("PlayEffect called at time ${element.time}, as ContinuousEvent")
        }
    }

    override suspend fun playEffect(effect: HapticPatternElement) {
        testWithHapticsElementType(effect)
    }

    fun playPattern(pattern: HapticPattern): List<String> {
        val sortedPattern = pattern.events.sortedBy { it.time }
        sortedPattern.forEach{element: HapticPatternElement -> testWithHapticsElementType(element)}
        return playedEvents
    }

}

