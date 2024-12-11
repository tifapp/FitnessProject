import { MutationHookOptions } from "@lib/ReactQuery"
import { UseMutationResult, useMutation } from "@tanstack/react-query"
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

export type FormValidationResult<
  Result extends { status: "invalid" },
  SubmissionArgs
> = Result | { status: "submittable"; submissionValues: SubmissionArgs }

export type FormSubmissionMutation<Result, Args> = UseMutationResult<
  Result,
  unknown,
  Args,
  unknown
>

/**
 * A hook that manages a form submission. Use this hook when you need to create a form hook, as this
 * hook only allows the form to be submitted if the form is valid. It also provides intel on when the
 * form is being submitted.
 *
 * @param submit A function to submit the form.
 * @param validate A function that validates the form.
 * @param options See the docs of {@link useMutation}.
 * @returns An object that allows the form to be submitted when it's valid.
 */
export const useFormSubmission = <
  SubmissionArgs,
  SubmissionResult,
  InvalidValidationResult extends { status: "invalid" }
>(
  submit: (args: SubmissionArgs) => Promise<SubmissionResult>,
  validate: (
    submissionMutation: FormSubmissionMutation<SubmissionResult, SubmissionArgs>
  ) => FormValidationResult<InvalidValidationResult, SubmissionArgs>,
  options?: MutationHookOptions<SubmissionResult, SubmissionArgs>
) => {
  const submissionMutation = useMutation({
    mutationFn: submit,
    ...options
  })
  const validationResult = validate(submissionMutation)

  if (validationResult.status === "invalid") {
    return { result: submissionMutation.data, ...validationResult }
  }

  if (submissionMutation.isPending) {
    return {
      result: submissionMutation.data,
      status: "submitting",
      submissionValues: validationResult.submissionValues
    } as const
  }

  return {
    result: submissionMutation.data,
    ...validationResult,
    submit: () => {
      submissionMutation.mutate(validationResult.submissionValues)
    }
  } as const
}

export type FormSubmission<
  SubmissionArgs,
  SubmissionResult,
  InvalidValidationResult extends { status: "invalid" }
> = ReturnType<
  typeof useFormSubmission<
    SubmissionArgs,
    SubmissionResult,
    InvalidValidationResult
  >
>
