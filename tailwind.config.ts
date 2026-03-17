import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        rankwise: {
          blue:   '#2563EB',
          indigo: '#4F46E5',
          teal:   '#0D9488',
        },
      },
      borderRadius: {
        xl:  '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
}

export default config
