import { FixedDateRange } from '@lib/date';
import { LocationCoordinate2D, Placemark, placemarkToFormattedAddress } from '@lib/location';
import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import Toast from 'react-native-root-toast';

export type CalendarEvent = {
  duration: FixedDateRange,
  id: string,
  description: string,
  placemark?: Placemark,
  coordinates: LocationCoordinate2D,
  title: string
}

const getPrimaryCalendar = (calendars: Calendar.Calendar[]) => {
  let primary = calendars.filter(cal => cal.isPrimary)

  if (primary.length === 0) {
    primary = calendars.filter(cal => cal.accessLevel === Calendar.CalendarAccessLevel.OWNER)
  }

  return primary[0]
}

export const getCalendar = async (): Promise<Calendar.Calendar> => {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  let primaryCalendar = getPrimaryCalendar(calendars)

  if (Platform.OS === "ios") {
    primaryCalendar = await Calendar.getDefaultCalendarAsync();
  }
  return primaryCalendar
}

export const addToCalendar = async (calendarId: string, event: CalendarEvent, setAddSuccessful: React.Dispatch<React.SetStateAction<boolean>>) => {
	const location = event.placemark ? placemarkToFormattedAddress(event.placemark)! : `${event.coordinates.latitude}, ${event.coordinates.longitude}`
  const description = event.description ? event.description : 'No description was provided'

  const calendarEvent: Partial<Calendar.Event> = {
    id: event.id,
    calendarId: calendarId,
    startDate: event.duration.startDate,
    endDate: event.duration.endDate,
    location: location,
    notes: description,
    title: `${event.title} - tiF Event`
  }
  
  await Calendar.createEventAsync(calendarId, calendarEvent)
    .then((eventId) => {
      setAddSuccessful(true)

      Toast.show("Event added to Calendar", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 100
      })
  }).catch((error) => {
    addNotSuccessful(error)
  })
/*
  if (eventId) {
    setAddSuccessful(true)

    Toast.show("Event added to Calendar", {
      duration: Toast.durations.SHORT,
      position: Toast.positions.BOTTOM,
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 100
    })
  } else {
    addNotSuccessful()
  }*/
}

export const addNotSuccessful = (errorMessage: string) => {
  Toast.show(errorMessage, {
    duration: Toast.durations.SHORT,
    position: Toast.positions.BOTTOM,
    shadow: true,
    animation: true,
    hideOnPress: true,
    delay: 100
  })
}