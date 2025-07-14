import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["Space Mono", "monospace"],
        sans: ["Space Mono", "monospace"],
        DEFAULT: ["Space Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
