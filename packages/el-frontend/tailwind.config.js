const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.resolve(__dirname, '../../node_modules/flowbite-react/**/*.js'),
    path.resolve(__dirname, './src/pages/**/*.{ts,tsx}'),
    path.resolve(__dirname, './src/components/**/*.{ts,tsx}'),
  ],
  theme: {
    extend: {},
  },
  plugins: [require('flowbite/plugin')],
};
