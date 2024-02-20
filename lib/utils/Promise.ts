export const allSettledShim = () => {
  Promise.allSettled =
  Promise.allSettled ||
  ((promises: any[]) =>
    Promise.all(
      promises.map((p: Promise<any>) =>
        p
          .then((value: any) => ({
            status: "fulfilled" as const,
            value
          }))
          .catch((reason: any) => ({
            status: "rejected" as const,
            reason
          }))
      )
    ))
}
