/*
 * The colors are CSS variables defined in src/app/globals.css, so they can switch to their dark
 * values with the system color scheme. <alpha-value> keeps modifiers like bg-primary/10 working.
 */
const color = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: {
        background: color('background'),
        foreground: color('foreground'),
        muted: {
          DEFAULT: color('muted'),
          foreground: color('muted-foreground'),
        },
        sidebar: color('sidebar'),
        card: color('card'),
        border: color('border'),
        input: color('input'),
        primary: {
          DEFAULT: color('primary'),
          foreground: color('primary-foreground'),
        },
        destructive: color('destructive'),
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};
