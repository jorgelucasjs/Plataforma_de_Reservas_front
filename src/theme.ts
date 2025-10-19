import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        // Cores principais baseadas na imagem
        primary: {
          50: { value: "#e6fffa" },
          100: { value: "#b3fff0" },
          200: { value: "#80ffe6" },
          300: { value: "#4dffdc" },
          400: { value: "#1affd2" },
          500: { value: "#00e6b8" }, // Cor turquesa/cyan principal
          600: { value: "#00b38f" },
          700: { value: "#008066" },
          800: { value: "#004d3d" },
          900: { value: "#001a14" },
        },
        navy: {
          50: { value: "#e8eef5" },
          100: { value: "#c2d4e6" },
          200: { value: "#9bb9d7" },
          300: { value: "#749fc8" },
          400: { value: "#4d84b9" },
          500: { value: "#1a3a52" }, // Azul marinho escuro do fundo
          600: { value: "#152e42" },
          700: { value: "#102331" },
          800: { value: "#0b1721" },
          900: { value: "#050c10" },
        },
        accent: {
          50: { value: "#fff5e6" },
          100: { value: "#ffe6b3" },
          200: { value: "#ffd780" },
          300: { value: "#ffc84d" },
          400: { value: "#ffb91a" },
          500: { value: "#e6a500" }, // Amarelo/dourado para destaques
          600: { value: "#b38000" },
          700: { value: "#805c00" },
          800: { value: "#4d3700" },
          900: { value: "#1a1300" },
        },
        bg: {
          canvas: { value: "#ffffff" },
          dark: { value: "#1a3a52" }, // Navy escuro
          light: { value: "#f8fafb" },
          card: { value: "#ffffff" },
        },
        text: {
          primary: { value: "#1a202c" },
          secondary: { value: "#4a5568" },
          muted: { value: "#718096" },
          inverse: { value: "#ffffff" },
        },
      },
    },
    semanticTokens: {
      colors: {
        // Tokens semânticos para facilitar o uso
        "bg.primary": { value: "{colors.navy.500}" },
        "bg.secondary": { value: "{colors.bg.light}" },
        "bg.accent": { value: "{colors.primary.500}" },
        "text.heading": { value: "{colors.text.primary}" },
        "text.body": { value: "{colors.text.secondary}" },
        "border.default": { value: "{colors.gray.200}" },
        "border.accent": { value: "{colors.primary.500}" },
      },
    },
  },
  globalCss: {
    "html, body": {
      bg: "bg.secondary",
      color: "text.body",
    },
  },
})

export const system = createSystem(defaultConfig, config)
