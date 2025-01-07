package com.tifapp.tifnative

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
    suspend fun playSound(element: HapticPatternElement.AudioCustom)
    suspend fun playEffect(effect: HapticPatternElement)
    suspend fun playPattern(pattern: ExpoObject) {
        val readablePattern = createReadablePattern(pattern)
        readablePattern.events.forEach { patternElement ->
            playEffect(patternElement)
        }
    }
}

//HapticPattern can be represented as a list of pattern elements, that get done in order
data class HapticPattern(val events: List<HapticPatternElement>)

@Suppress ("UNCHECKED_CAST")
fun createReadableEvent (patternElement: Map<String, Any?>): HapticPatternElement? {
    if (!patternElement.containsKey("Event")) return null
    val event = patternElement["Event"] as Map<String, Any?>
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
    val initialPattern = givenPattern["Pattern"] as List<Map<String, Any?>>
    println(initialPattern)
    val readablePattern = mutableListOf<HapticPatternElement>()

    initialPattern.forEach { patternElement ->
        createReadableEvent(patternElement)?.let { readablePattern.add(it) }
    }
    readablePattern.sortBy { it.time }
    return HapticPattern(events = readablePattern)
}




