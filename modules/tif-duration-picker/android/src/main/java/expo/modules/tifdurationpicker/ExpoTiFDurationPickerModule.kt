package expo.modules.tifdurationpicker

import android.os.Build
import androidx.annotation.RequiresApi
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.flow.update

@RequiresApi(Build.VERSION_CODES.O)
class ExpoTiFDurationPickerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("TimePicker")

    View(ExpoTiFDurationPickerView::class) {
      Events("onDurationChange")
      Prop("initialDurationSeconds") { view: ExpoTiFDurationPickerView, initialDurationSeconds: Int ->
        view.state.update { it.copy(initialDurationSeconds = initialDurationSeconds) }
      }
    }
  }
}
