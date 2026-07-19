/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#FBFBFD',
        ink: '#1D1D1F',
        muted: '#86868B',
        divider: '#E8E8ED',
        elevated: '#F5F5F7',
        accent: {
          DEFAULT: '#0071E3',
          hover: '#0077ED',
          light: '#E8F2FD',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'apple': '20px',
        'apple-lg': '24px',
        'apple-sm': '12px',
        'apple-md': '16px',
      },
      boxShadow: {
        'apple': '0 0 0 1px rgba(0,0,0,0.04)',
        'apple-hover': '0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
        'apple-elevated': '0 8px 32px rgba(0,0,0,0.08)',
        'apple-drawer': '0 16px 48px rgba(0,0,0,0.12)',
      },
      backdropBlur: {
        'apple': '20px',
      },
    },
  },
  plugins: [],
}
