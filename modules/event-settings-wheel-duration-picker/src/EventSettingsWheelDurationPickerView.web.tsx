import * as React from 'react';

import { EventSettingsWheelDurationPickerViewProps } from './EventSettingsWheelDurationPicker.types';

export default function EventSettingsWheelDurationPickerView(props: EventSettingsWheelDurationPickerViewProps) {
  return (
    <div>
      <span>{props.name}</span>
    </div>
  );
}
