import { User } from "@lib/users/User"
import { atom } from "jotai"

export const userAtom = atom<User | undefined>(undefined)
export const hasEditedProfileAtom = atom(false)
