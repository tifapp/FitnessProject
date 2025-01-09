package com.tifapp.tifnative

import kotlinx.coroutines.runBlocking
import org.junit.Test

import org.junit.Assert.*

class CustomHapticsTest {

    @Test
    fun `Test for reading + using ahapPattern` (): Unit = runBlocking {
        val exampleAhap: Map<String, Any?> =
            mapOf(
                "Version" to 1,
                "Metadata" to mapOf(
                    "Project" to "Haptic Sampler",
                    "Created" to "5 June 2019",
                    "Description" to "A sequence of haptic events paired with a custom audio file."
                ),
                "Pattern" to listOf(
                    mapOf(
                        "Event" to mapOf(
                            "Time" to 0.1,
                            "EventType" to "HapticTransient",
                            "EventParameters" to listOf(
                                mapOf("ParameterID" to "HapticIntensity", "ParameterValue" to 0.5),
                                mapOf("ParameterID" to "HapticSharpness", "ParameterValue" to 0.5)
                            )
                        )
                    ),
                    mapOf(
                        "Event" to mapOf(
                            "Time" to 0.0,
                            "EventType" to "HapticContinuous",
                            "EventDuration" to 0.5,
                            "EventParameters" to listOf(
                                mapOf("ParameterID" to "HapticIntensity", "ParameterValue" to 0.5),
                                mapOf("ParameterID" to "HapticSharpness", "ParameterValue" to 0.5)
                            )
                        )
                    )
                )
            )
        val testHapticPlayer = TestHapticsPatternPlayer()
        testHapticPlayer.playPattern(exampleAhap)
        testHapticPlayer.getEvents()
        assertEquals(testHapticPlayer.getEvents(), listOf(HapticPatternElement.ContinuousEvent(0.0, 0.5, 0.5), HapticPatternElement.TransientEvent(0.1, 0.5)))
    }

    @Test
    fun `Read complex AHAPPattern`() = runBlocking {
        val exampleAhap: Map<String, Any?> =
            mapOf(
                "Version" to 1,
                "Pattern" to listOf(
                    mapOf(
                        "Event" to mapOf(
                            "Time" to 0.0,
                            "EventType" to "HapticTransient",
                            "EventParameters" to listOf(
                                mapOf("ParameterID" to "HapticIntensity", "ParameterValue" to 0.5),
                                mapOf("ParameterID" to "HapticSharpness", "ParameterValue" to 0.5)
                            )
                        )
                    ),
                    mapOf(
                        "Event" to mapOf(
                            "Time" to 0.5,
                            "EventType" to "HapticTransient",
                            "EventParameters" to listOf(
                                mapOf("ParameterID" to "HapticIntensity", "ParameterValue" to 0.5),
                                mapOf("ParameterID" to "HapticSharpness", "ParameterValue" to 0.5)
                            )
                        )
                    ),
                    mapOf(
                        "Event" to mapOf(
                            "Time" to 0.0,
                            "EventType" to "HapticContinuous",
                            "EventDuration" to 3.0,
                            "EventParameters" to listOf(
                                mapOf("ParameterID" to "HapticIntensity", "ParameterValue" to 1.0),
                                mapOf("ParameterID" to "HapticSharpness", "ParameterValue" to 0.2),
                                mapOf("ParameterID" to "ReleaseTime", "ParameterValue" to 1.0)
                            )
                        )
                    ),
                    mapOf(
                        "ParameterCurve" to mapOf(
                            "ParameterID" to "AudioBrightnessControl",
                            "Time" to 0.0,
                            "ParameterCurveControlPoints" to listOf(
                                mapOf("ParameterValue" to 1.0, "Time" to 3.0),
                                mapOf("ParameterValue" to 0.5, "Time" to 4.5),
                                mapOf("ParameterValue" to 0.1, "Time" to 5.5)
                            )
                        )
                    )
                )
            )
        val testHapticPlayer = TestHapticsPatternPlayer()
        testHapticPlayer.playPattern(exampleAhap)
        testHapticPlayer.getEvents()
        assertEquals(
            listOf(
                HapticPatternElement.TransientEvent(0.0, 0.5),
                HapticPatternElement.ContinuousEvent(0.0, 3.0, intensity=1.0),
                HapticPatternElement.TransientEvent(0.5, 0.5)
            ),
            testHapticPlayer.getEvents()
        )
    }

    @Test
    fun `Test for playing audioCustom` (): Unit = runBlocking {
        val exampleAhap: Map<String, Any?> =
            mapOf(
                "Version" to 1,
                "Metadata" to mapOf(
                    "Project" to "Haptic Sampler",
                    "Created" to "5 June 2019",
                    "Description" to "A sequence of haptic events paired with a custom audio file."
                ),
                "Pattern" to listOf(
                    mapOf(
                        "Event" to mapOf(
                            "Time" to 0.1,
                            "EventType" to "HapticTransient",
                            "EventParameters" to listOf(
                                mapOf("ParameterID" to "HapticIntensity", "ParameterValue" to 0.5),
                                mapOf("ParameterID" to "HapticSharpness", "ParameterValue" to 0.5)
                            )
                        )
                    ),
                    mapOf(
                        "Event" to mapOf(
                            "Time" to 0.0,
                            "EventType" to "AudioCustom",
                            "EventWaveformPath" to "hall/lol.wav",
                            "EventParameters" to listOf(
                                mapOf("ParameterID" to "AudioVolume", "ParameterValue" to 0.5),
                            )
                        )
                    )
                )
            )
        val testHapticPlayer = TestHapticsPatternPlayer()
        testHapticPlayer.playPattern(exampleAhap)
        assertEquals(testHapticPlayer.getEvents(), listOf(HapticPatternElement.AudioCustom(0.0, "hall/lol.wav", 0.5), HapticPatternElement.TransientEvent(0.1, 0.5)))
    }

    @Test
    fun `Test for reading a invalid transient event, missing time` (): Unit = runBlocking {
        val exampleAhap: Map<String, Any?> =
            mapOf(
                "Event" to mapOf(
                    "EventType" to "HapticTransient",
                    "EventParameters" to listOf(
                        mapOf("ParameterID" to "HapticIntensity", "ParameterValue" to 0.5),
                        mapOf("ParameterID" to "HapticSharpness", "ParameterValue" to 0.5)
                    )
                )
            )
        assertNull(createReadableEvent(exampleAhap))
    }

    @Test
    fun `Test for reading a valid transient event` (): Unit = runBlocking {
        val exampleAhap: Map<String, Any?> =
            mapOf(
                "Event" to mapOf(
                    "Time" to 0.0,
                    "EventType" to "HapticTransient",
                    "EventParameters" to listOf(
                        mapOf("ParameterID" to "HapticIntensity", "ParameterValue" to 0.5),
                        mapOf("ParameterID" to "HapticSharpness", "ParameterValue" to 0.5)
                    )
                )
            )
        assertEquals(createReadableEvent(exampleAhap), HapticPatternElement.TransientEvent(0.0, 0.5))
    }



    @Test
    fun `Test for reading an invalid continuous event, missing duration` (): Unit = runBlocking {
        val exampleAhap: Map<String, Any?> =
            mapOf(
                "Event" to mapOf(
                    "Time" to 0.0,
                    "EventType" to "HapticContinuous",
                    "EventParameters" to listOf(
                        mapOf("ParameterID" to "HapticIntensity", "ParameterValue" to 0.5),
                        mapOf("ParameterID" to "HapticSharpness", "ParameterValue" to 0.5)
                    )
                )
            )
        assertNull(createReadableEvent(exampleAhap))
    }

    @Test
    fun `Test for reading an valid continuous event` (): Unit = runBlocking {
        val exampleAhap: Map<String, Any?> =
            mapOf(
                "Event" to mapOf(
                    "Time" to 0.0,
                    "EventType" to "HapticContinuous",
                    "EventDuration" to 0.5,
                    "EventParameters" to listOf(
                        mapOf("ParameterID" to "HapticIntensity", "ParameterValue" to 0.5),
                        mapOf("ParameterID" to "HapticSharpness", "ParameterValue" to 0.5)
                    )
                )
            )
        assertEquals(createReadableEvent(exampleAhap), HapticPatternElement.ContinuousEvent(0.0, 0.5, 0.5))
    }

    @Test
    fun `Test for reading an invalid audioCustom event, missing eventWaveform` (): Unit = runBlocking {
        val exampleAhap: Map<String, Any?> =
            mapOf(
                "Event" to mapOf(
                    "Time" to 0.0,
                    "EventType" to "AudioCustom",
                    "EventParameters" to listOf(
                        mapOf("ParameterID" to "AudioVolume", "ParameterValue" to 0.5),
                    )
                )
            )
        assertNull(createReadableEvent(exampleAhap))
    }

    @Test
    fun `Test for reading an valid audioCustom event` (): Unit = runBlocking {
        val exampleAhap: Map<String, Any?> =
            mapOf(
                "Event" to mapOf(
                    "Time" to 0.0,
                    "EventType" to "AudioCustom",
                    "EventWaveformPath" to "hall/lol.wav",
                    "EventParameters" to listOf(
                        mapOf("ParameterID" to "AudioVolume", "ParameterValue" to 0.5),
                    )
                )
            )
        assertEquals(createReadableEvent(exampleAhap), HapticPatternElement.AudioCustom(0.0, "hall/lol.wav", 0.5))
    }

}

public class TestHapticsPatternPlayer : HapticsPlayer {
    private val playedEvents = mutableListOf<HapticPatternElement>()
    override suspend fun playSound(element: HapticPatternElement.AudioCustom) {
        playedEvents.add(element)
    }

    override suspend fun playEffect(effect: HapticPatternElement) {
        playedEvents.add(effect)
    }

    fun getEvents(): List<HapticPatternElement> {
        return playedEvents
    }
}