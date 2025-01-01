package com.example.androidcustomhaptics

import kotlinx.coroutines.runBlocking
import org.junit.Test

import org.junit.Assert.*

@Suppress("IllegalIdentifier")
class CustomHapticsTest {

    @Test
    fun `Test for reading + using ahapPattern` () = runBlocking {
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
        val playedPattern = TestHapticsPatternPlayer().playPattern(createReadablePattern((exampleAhap)))
        assertEquals(playedPattern, listOf("PlayEffect called at time 0.0, as ContinuousEvent", "PlayEffect called at time 0.1, as TransientEvent"))
    }

    @Test
    fun `Test for creating a valid pattern from ahapPattern` () = runBlocking {
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
        assertEquals(createReadablePattern(exampleAhap), HapticPattern(listOf(HapticPatternElement.ContinuousEvent(0.0, 0.5, 0.5), HapticPatternElement.TransientEvent(0.1, 0.5))))
    }

    @Test
    fun `Test for reading a invalid transient event, missing time` () = runBlocking {
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
    fun `Test for reading a valid transient event` () = runBlocking {
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
    fun `Test for reading an invalid continuous event, missing duration` () = runBlocking {
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
    fun `Test for reading an valid continuous event` () = runBlocking {
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
    fun `Test for reading an invalid audioCustom event, missing eventWaveform` () = runBlocking {
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
    fun `Test for reading an valid audioCustom event` () = runBlocking {
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