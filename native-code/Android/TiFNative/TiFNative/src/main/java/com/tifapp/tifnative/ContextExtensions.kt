package com.tifapp.tifnative

import android.content.Context
import android.os.Build
import android.os.Vibrator
import android.os.VibratorManager

public val Context.defaultVibrator: Vibrator
    get() = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        (this.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager).defaultVibrator
    } else {
        @Suppress("DEPRECATION")
        this.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
    }

public val Context.isHapticsSupportedOnDevice: Boolean
    get() = this.defaultVibrator.hasVibrator()