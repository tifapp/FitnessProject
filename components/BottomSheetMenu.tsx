import { useMutation } from "@tanstack/react-query"
import { useEffect, useState } from "react"

export type TiFBottomSheetMenuContent = {
  title: string
  description: string
  ctaText: string
  ctaAction: () => Promise<void>
}

export type TiFBottomSheetMenu = {
  contents: TiFBottomSheetMenuContent[]
  onFinished?: () => void
}

export const useBottomSheetMenu = () => {
  const [index, setIndex] = useState(0)
  const [menu, setMenu] = useState<TiFBottomSheetMenu | undefined>()
  const ctaMutation = useMutation({
    mutationFn: async (menu: TiFBottomSheetMenu) => {
      if (index >= menu.contents.length) return
      await menu.contents[index].ctaAction()
    },
    onSettled: () => setIndex((index) => index + 1)
  })

  useEffect(() => {
    if (!menu) return
    if (index >= menu.contents.length) {
      menu.onFinished?.()
    }
  }, [index, menu])

  return {
    present: (menu: TiFBottomSheetMenu) => {
      setMenu(menu)
      setIndex(0)
    },
    content: menu
      ? {
          ...menu.contents[index],
          ctaAction: async () => await ctaMutation.mutateAsync(menu)
        }
      : undefined,
    dismissed: () => setIndex((index) => index + 1)
  }
}

export type TiFBottomSheetMenuState = ReturnType<typeof useBottomSheetMenu>
