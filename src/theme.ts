import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        bg: {
          canvas: { value: "{colors.white}" },
        },
      },
    },
  },
  globalCss: {
    "html, body": {
      bg: "gray.50",
      color: "gray.800",
    },
  },
})

export const system = createSystem(defaultConfig, config)
