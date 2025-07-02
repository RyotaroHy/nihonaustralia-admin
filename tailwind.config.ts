import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/flowbite-react/**/*.js',
    '.flowbite-react/class-list.json',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;