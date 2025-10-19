import { getData } from "@/dao/localStorage"
import type { User } from "@/types"


export const LOCALSTORAGE_USERDATA = 'LOCAL_STORAGE_USER_DATA'

export const CURRENT_USER_INFO = getData(LOCALSTORAGE_USERDATA) as User
