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
import { render, screen } from "@testing-library/react-native"
import { _negateDependencyKeyDefaultValueTestContext } from "./helpers"

const testString1 = "Hello World"
const testString2 = "Goodbye World"

describe("DependencyHooks tests", () => {
  _negateDependencyKeyDefaultValueTestContext()

  describe("SetDependencyValue tests", () => {
    it("creates a new DependencyValues instance for the child context", () => {
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

    it("preserves current values in child context", () => {
      const key1 = createDependencyKey<string>()
      const key2 = createDependencyKey<string>()

      const ChildComponent = () => {
        const [d1, d2] = useDependencyValues<[string, string]>([key1, key2])
        return (
          <>
            <View testID={makeChildId(d1)} />
            <View testID={makeChildId(d2)} />
          </>
        )
      }

      const ParentComponent = () => (
        <SetDependencyValue forKey={key1} value={testString1}>
          <SetDependencyValue forKey={key2} value={testString2}>
            <ChildComponent />
          </SetDependencyValue>
        </SetDependencyValue>
      )

      render(<ParentComponent />)

      expect(childId(testString1)).toBeDisplayed()
      expect(childId(testString2)).toBeDisplayed()
    })
  })

  describe("UpdateDependencyValues tests", () => {
    it("creates a new DependencyValues instance for the child context", () => {
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

    it("preserves current values in child context", () => {
      const key1 = createDependencyKey<string>()
      const key2 = createDependencyKey<string>()

      const ChildComponent = () => {
        const [d1, d2] = useDependencyValues<[string, string]>([key1, key2])
        return (
          <>
            <View testID={makeChildId(d1)} />
            <View testID={makeChildId(d2)} />
          </>
        )
      }

      const ParentComponent = () => (
        <UpdateDependencyValues
          update={(values) => values.set(key1, testString1)}
        >
          <UpdateDependencyValues
            update={(values) => values.set(key2, testString2)}
          >
            <ChildComponent />
          </UpdateDependencyValues>
        </UpdateDependencyValues>
      )

      render(<ParentComponent />)

      expect(childId(testString1)).toBeDisplayed()
      expect(childId(testString2)).toBeDisplayed()
    })
  })
})

const parentId = (value: string) => screen.queryByTestId(makeParentId(value))
const childId = (value: string) => screen.queryByTestId(makeChildId(value))

const makeParentId = (value: string) => `parent=${value}`
const makeChildId = (value: string) => `child=${value}`
