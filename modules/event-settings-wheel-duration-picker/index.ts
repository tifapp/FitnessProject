import { NativeModulesProxy, EventEmitter, Subscription } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to EventSettingsWheelDurationPicker.web.ts
// and on native platforms to EventSettingsWheelDurationPicker.ts
import EventSettingsWheelDurationPickerModule from './src/EventSettingsWheelDurationPickerModule';
import EventSettingsWheelDurationPickerView from './src/EventSettingsWheelDurationPickerView';
import { ChangeEventPayload, EventSettingsWheelDurationPickerViewProps } from './src/EventSettingsWheelDurationPicker.types';

// Get the native constant value.
export const PI = EventSettingsWheelDurationPickerModule.PI;

export function hello(): string {
  return EventSettingsWheelDurationPickerModule.hello();
}

export async function setValueAsync(value: string) {
  return await EventSettingsWheelDurationPickerModule.setValueAsync(value);
}

const emitter = new EventEmitter(EventSettingsWheelDurationPickerModule ?? NativeModulesProxy.EventSettingsWheelDurationPicker);

export function addChangeListener(listener: (event: ChangeEventPayload) => void): Subscription {
  return emitter.addListener<ChangeEventPayload>('onChange', listener);
}

export { EventSettingsWheelDurationPickerView, EventSettingsWheelDurationPickerViewProps, ChangeEventPayload };
