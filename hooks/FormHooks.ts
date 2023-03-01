import { FieldValues, useFormContext } from "react-hook-form"

/**
 * A helper to use a form context from [`react-hook-form`](https://react-hook-form.com/)
 * which throws if the context is null.
 */
export const useReactHookFormContext = <T extends FieldValues>() => {
  const formContext = useFormContext<T>()
  if (!formContext) {
    throw new Error(`
    Attempted to use a component that required a form context, but none was available.
          
    To fix this, make sure to wrap the component with a FormProvider from react-hook-form.
    `)
  }
  return formContext
}
