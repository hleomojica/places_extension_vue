/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        white: '#FFFFFF',
        'txt-white': '#F3F4F6',
        brand: '#3A1D24',
        gray: {
          100: '#F3F4F6',
          200: '#e5e7eb', // Border color
          400: '#F9FAFB', // Border bg
          300: '#E5E5E5', // Background
          900: '#6C727F',
          1000: '#6B7280'
        },
        primary: {
          900: '#4285f4',
          800: '#5491F5',
          700: '#679DF6',
          600: '#7AA9F7',
          500: '#8DB5F8',
          400: '#A0C1F9',
          300: '#B3CEFA',
          200: '#C6DAFB',
          100: '#D9E6FC',
          50: '#ECF2FD'
        },
        secondary: {
          900: '#5842f4',
          800: '#6854F5',
          700: '#7967F6',
          600: '#8A7AF7',
          500: '#9A8DF8',
          400: '#ABA0F9',
          300: '#BCB3FA',
          200: '#CCC6FB',
          100: '#DDD9FC',
          50: '#EEECFD'
        },
        tertiary: {
          900: '#f4b142',
          800: '#F5B854',
          700: '#F6C067',
          600: '#F7C87A',
          500: '#F8D08D',
          400: '#F9D8A0',
          300: '#FADFB3',
          200: '#FBE7C6',
          100: '#FCEFD9',
          50: '#FDF7EC'
        },
        rmvf: {
          900: '#006494',
          800: '#0073A8',
          700: '#0083CC',
          600: '#0093F0',
          500: '#00A3FF',
          400: '#00B3FF',
          300: '#00C3FF',
          200: '#00D3FF',
          100: '#00E3FF'
        },
        rmvf2: {
          900: '#FF5142',
          800: '#FF6254',
          700: '#FF7367',
          600: '#FF847A',
          500: '#FF958D',
          400: '#FFA5A0',
          300: '#FFB6B3',
          200: '#FFC7C6',
          100: '#FFD8D9'
        }
      },
      backgroundImage: {
        blurimg: "url('static/blurimg.png')"
      }
    }
  },
  plugins: []
}
