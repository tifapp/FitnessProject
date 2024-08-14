import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';

import { EventSettingsWheelDurationPickerViewProps } from './EventSettingsWheelDurationPicker.types';

const NativeView: React.ComponentType<EventSettingsWheelDurationPickerViewProps> =
  requireNativeViewManager('EventSettingsWheelDurationPicker');

export default function EventSettingsWheelDurationPickerView(props: EventSettingsWheelDurationPickerViewProps) {
  return <NativeView {...props} />;
}
