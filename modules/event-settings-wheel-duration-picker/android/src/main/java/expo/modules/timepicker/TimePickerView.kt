package expo.modules.timepicker

import android.content.Context
import android.os.Build
import androidx.annotation.RequiresApi
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import kotlinx.coroutines.flow.MutableStateFlow

@RequiresApi(Build.VERSION_CODES.O)
class TimePickerView(context: Context, appContext: AppContext) :
    ExpoView(context, appContext) {
    val onDurationChange by EventDispatcher()
    val state = MutableStateFlow(TimePickerState(0, DpSize(0.dp, 0.dp)))
    internal val composeView = ComposeView(context).also { it ->

        it.layoutParams = LayoutParams(
            LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT
        )
        it.setContent {
            val state by this.state.collectAsState()
            println("TestSize$state.size")
            TimePicker(
                initialDuration = state.initialDuration,
                onDurationChange = { onDurationChange(mapOf("duration" to it)) },
                size = state.size
            )

        }
        addView(it)
    }
}

data class TimePickerState(val initialDuration: Int, val size: DpSize)