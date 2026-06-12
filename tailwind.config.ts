import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef7f3',
          100: '#d4ede5',
          200: '#aadacc',
          300: '#74c0ae',
          400: '#44a38f',
          500: '#2a8a75',
          600: '#1f6e5c',
          700: '#1a5a4b',
          800: '#174d40',
          900: '#154035',
          950: '#0b261f',
        },
      },
      fontFamily: {
        serif: ['var(--font-lora)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
