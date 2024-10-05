package expo.modules.timepicker

import android.os.Build
import androidx.annotation.RequiresApi
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import com.commandiron.wheel_picker_compose.WheelTimePicker
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.update
import java.time.LocalTime

@RequiresApi(Build.VERSION_CODES.O)
class TimePickerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("TimePicker")

    View(TimePickerView::class) {
      Events("onDurationChange")
      Prop("initialDuration") { view: TimePickerView, initialDuration: Int ->
        view.state.update { it.copy(initialDuration = initialDuration) }
      }
      Prop("size") { view: TimePickerView, size: Map<String, Int> ->
        println("TestLog$size")
        view.state.update {
          it.copy(
            size = DpSize(
              size.getOrDefault("width", 0).dp,
              size.getOrDefault("height", 0).dp
            )
          )
        }
      }
    }
  }
}

@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun TimePicker(
  initialDuration: Int,
  onDurationChange: (Int) -> Unit,
  size: DpSize,
  modifier: Modifier = Modifier
) {
  var size by remember { mutableStateOf(DpSize(0.dp, 0.dp)) }
  Box(modifier = modifier.onGloballyPositioned { coordinates ->
    size = DpSize(coordinates.size.width.dp, coordinates.size.height.dp)
  }) {
    WheelTimePicker(
      startTime = LocalTime.of(
        initialDuration / 3600,
        (initialDuration / 60) % 60,
        initialDuration % 60
      ),
      size = size
    ) { snappedTime -> onDurationChange(snappedTime.toSecondOfDay()) }
  }
}

@RequiresApi(Build.VERSION_CODES.O)
@Preview
@Composable
fun TimePickerPreview() {
  TimePicker(0, size = DpSize(300.dp, 300.dp), onDurationChange = {})
}

