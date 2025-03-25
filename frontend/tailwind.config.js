/** @type {import('tailwindcss').Config} */

import daisyui from 'daisyui'

module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["light", "dark", "synthwave"], // Keep this consistent with your ThemeSwitcher
  },
};
