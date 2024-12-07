const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Coinbase Sans', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        'base-blue': '#0052FF',
        'base-black': '#000000',
        'base-white': '#FFFFFF',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
