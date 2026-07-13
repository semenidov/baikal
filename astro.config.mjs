// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Placeholder — swap for the real domain once the agency name/domain is chosen.
  site: 'https://baikal.example.com',
  vite: {
    plugins: [tailwindcss()],
  },
});
