/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../shared/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        admin: {
          primary: '#1e40af',
          secondary: '#7c3aed',
          success: '#059669',
          warning: '#d97706',
          danger: '#dc2626',
          dark: '#111827',
          light: '#f9fafb',
        },
      },
    },
  },
  plugins: [],
}
