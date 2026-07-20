// Flat config (ESLint 10). Линтер для TS + Astro.
// Форматирование отдаём Prettier — eslint-config-prettier отключает конфликтующие
// стилевые правила, чтобы ESLint и Prettier не спорили.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist/', '.astro/', 'node_modules/', 'public/'] },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,

  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // any запрещён по соглашениям рабочего пространства.
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },

  {
    // Отключаем базовый no-undef для TS/Astro: неопределённые идентификаторы и
    // глобальные типы (напр. ImageMetadata из astro:assets) проверяет TypeScript
    // (astro check), а core-правило их не знает и даёт ложные срабатывания.
    files: ['**/*.ts', '**/*.astro'],
    rules: { 'no-undef': 'off' },
  },

  // Отключает правила, конфликтующие с Prettier. Должен идти последним.
  prettier,
);
