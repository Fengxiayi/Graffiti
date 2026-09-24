import type { Config } from 'tailwindcss';

// Tailwind v4 通过 client/src/index.css 中的 @config 指令引用本配置
export default {
  content: ['./client/src/**/*.{ts,tsx,css}'],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
