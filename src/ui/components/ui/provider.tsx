"use client"

import { ChakraProvider } from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"
import systemMoMenu from "@/libs/chakra-ui-api/theme"

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={systemMoMenu}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  )
}
