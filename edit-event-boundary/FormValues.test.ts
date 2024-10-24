import { createStore } from "jotai"
import {
  editEventFormValueAtoms,
  eventEditAtom,
  DEFAULT_EDIT_EVENT_FORM_VALUES
} from "./FormValues"
import { mockLocationCoordinate2D, mockPlacemark } from "@location/MockData"
import { faker } from "@faker-js/faker"

describe("EventFormValues tests", () => {
  test("Default Values should not be submittable", () => {
    const store = createStore()
    expect(store.get(eventEditAtom)).toEqual(undefined)
  })

  it("should be submittable when adding a title and coordinate location", () => {
    const store = createStore()
    const title = faker.lorem.words()
    const coordinate = mockLocationCoordinate2D()
    store.set(editEventFormValueAtoms.title, title)
    store.set(editEventFormValueAtoms.location, {
      coordinate,
      placemark: undefined
    })
    expect(store.get(eventEditAtom)).toEqual({
      ...DEFAULT_EDIT_EVENT_FORM_VALUES,
      title,
      location: { type: "coordinate", value: coordinate }
    })
  })

  it("should be submittable when adding a title and placemark", () => {
    const store = createStore()
    const title = faker.lorem.words()
    const placemark = mockPlacemark()
    store.set(editEventFormValueAtoms.title, title)
    store.set(editEventFormValueAtoms.location, {
      coordinate: undefined,
      placemark
    })
    expect(store.get(eventEditAtom)).toEqual({
      ...DEFAULT_EDIT_EVENT_FORM_VALUES,
      title,
      location: { type: "placemark", value: placemark }
    })
  })

  it("should prefer the placemark to the coordinate when validating form values", () => {
    const store = createStore()
    const title = faker.lorem.words()
    const placemark = mockPlacemark()
    store.set(editEventFormValueAtoms.title, title)
    store.set(editEventFormValueAtoms.location, {
      coordinate: mockLocationCoordinate2D(),
      placemark
    })
    expect(store.get(eventEditAtom)).toEqual({
      ...DEFAULT_EDIT_EVENT_FORM_VALUES,
      title,
      location: { type: "placemark", value: placemark }
    })
  })
})
