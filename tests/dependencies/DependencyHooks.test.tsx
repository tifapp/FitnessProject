import React from "react"
import { View } from "react-native"
import {
  createDependencyKey,
  SetDependencyValue,
  UpdateDependencyValues,
  useDependencyValue,
  useDependencyValues
} from "../../lib/dependencies"
import "../helpers/Matchers"
import { render, renderHook, screen } from "@testing-library/react-native"

const testString1 = "Hello World"
const testString2 = "Goodbye World"

describe("DependencyHooks tests", () => {
  test("SetDependencyValue creates a new DependencyValues instance for the child context", () => {
    const key = createDependencyKey(testString1)

    const ChildComponent = () => {
      const dependency = useDependencyValue(key)
      return <View testID={makeChildId(dependency)} />
    }

    const ParentComponent = () => {
      const dependency = useDependencyValue(key)
      return (
        <SetDependencyValue forKey={key} value={testString2}>
          <ChildComponent />
          <View testID={makeParentId(dependency)} />
        </SetDependencyValue>
      )
    }

    render(<ParentComponent />)

    expect(parentId(testString1)).toBeDisplayed()
    expect(childId(testString2)).toBeDisplayed()
  })

  test("UpdateDependencyValues creates a new DependencyValues instance for the child context", () => {
    const key = createDependencyKey(testString1)

    const ChildComponent = () => {
      const dependency = useDependencyValue(key)
      return <View testID={makeChildId(dependency)} />
    }

    const ParentComponent = () => {
      const dependency = useDependencyValue(key)
      return (
        <UpdateDependencyValues
          update={(values) => {
            values.set(key, testString2)
          }}
        >
          <ChildComponent />
          <View testID={makeParentId(dependency)} />
        </UpdateDependencyValues>
      )
    }

    render(<ParentComponent />)

    expect(parentId(testString1)).toBeDisplayed()
    expect(childId(testString2)).toBeDisplayed()
  })

  test("useDependencyValues returns proper values for keys", () => {
    const key1 = createDependencyKey(testString1)
    const key2 = createDependencyKey(testString2)

    const { result } = renderHook(() => {
      return useDependencyValues<[string, string]>([key1, key2])
    })
    const [value1, value2] = result.current

    expect(value1).toEqual(testString1)
    expect(value2).toEqual(testString2)
  })
})

const parentId = (value: string) => screen.queryByTestId(makeParentId(value))
const childId = (value: string) => screen.queryByTestId(makeChildId(value))

const makeParentId = (value: string) => `parent=${value}`
const makeChildId = (value: string) => `child=${value}`
