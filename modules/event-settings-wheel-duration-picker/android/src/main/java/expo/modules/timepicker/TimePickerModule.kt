package expo.modules.timepicker

import android.os.Build
import androidx.annotation.RequiresApi
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import com.commandiron.wheel_picker_compose.WheelTimePicker
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.flow.update
import java.time.LocalTime

@RequiresApi(Build.VERSION_CODES.O)
class TimePickerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("TimePicker")

    View(TimePickerView::class) {
      Events("onDurationChange")
      Prop("initialDurationSeconds") { view: TimePickerView, initialDurationSeconds: Int ->
        view.state.update { it.copy(initialDurationSeconds = initialDurationSeconds) }
      }
    }
  }
}
