package expo.modules.tifdurationpicker

import android.content.Context
import android.os.Build
import androidx.annotation.RequiresApi
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.DpSize
import com.commandiron.wheel_picker_compose.WheelTimePicker
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import kotlinx.coroutines.flow.MutableStateFlow
import java.time.LocalTime

@RequiresApi(Build.VERSION_CODES.O)
class ExpoTiFDurationPickerView(context: Context, appContext: AppContext) :
    ExpoView(context, appContext) {
        val onDurationChange by EventDispatcher()
        val state = MutableStateFlow(DurationPickerState(0))
        internal val composeView = ComposeView(context).also { it ->

            it.layoutParams = LayoutParams(
                LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT
            )
            it.setContent {
                val state by this.state.collectAsState()
                DurationPicker(
                    initialDurationSeconds = state.initialDurationSeconds,
                    onDurationChange = { onDurationChange(mapOf("duration" to it)) }
                )
            }
            addView(it)
        }
    }

data class DurationPickerState(val initialDurationSeconds: Int)

@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun DurationPicker(
    initialDurationSeconds: Int,
    onDurationChange: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    BoxWithConstraints(
        modifier = modifier.fillMaxSize()
    ) {
        val size = DpSize(maxWidth, maxHeight)

        WheelTimePicker(
            startTime = LocalTime.of(
                initialDurationSeconds / 3600,
                (initialDurationSeconds / 60) % 60,
                initialDurationSeconds % 60
            ),
            size = size
        ) { snappedTime ->
            onDurationChange(snappedTime.toSecondOfDay())
        }
    }
}

@RequiresApi(Build.VERSION_CODES.O)
@Preview
@Composable
fun DurationPickerPreview() {
    DurationPicker(0, {})
}
