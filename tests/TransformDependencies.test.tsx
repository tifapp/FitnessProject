import {
  DependenciesProvider,
  DependencyValues,
  TransformDependencies,
  useDependencies,
} from "../lib/Dependencies";
import { renderHook } from "@testing-library/react-native";
import { ReactNode } from "react";

interface TestDependencyValues extends DependencyValues {
  testNum: number;
}

describe("TransformDependencies tests", () => {
  it("should be able to map dependencies to a child context", () => {
    const wrapper = (children: ReactNode) => {
      // NB: Idk why, but for some reason renderHook passes in the child object with
      // a children key (eg. { children: { child stuff } } instead of { child stuff }
      // like in normal cases)...
      const actualChildren = (children as any).children;
      return (
        <DependenciesProvider values={{ testNum: 1 }}>
          <TransformDependencies
            transform={(deps: TestDependencyValues) => ({
              ...deps,
              testNum: deps.testNum + 1,
            })}
          >
            {actualChildren}
          </TransformDependencies>
        </DependenciesProvider>
      );
    };

    const { result } = renderHook(useDependencies, { wrapper });
    const mappedTestNum = (result.current as TestDependencyValues).testNum;
    expect(mappedTestNum).toEqual(2);
  });
});
