// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Боевой адрес. Поменять на кастомный домен, когда подключим.
  site: 'https://baikal-tour.vercel.app',
  integrations: [sitemap()],
  build: {
    // Встраиваем CSS инлайном в HTML — убирает render-blocking запрос стилей.
    inlineStylesheets: 'always',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
