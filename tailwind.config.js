// tailwind.config.js
const plugin = require('tailwindcss/plugin');

module.exports = {
  // This is your normal content configuration for the whole app.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],

  // Your default theme for the main application remains empty.
  // This means it will use the standard Tailwind CSS defaults.
  theme: {
    extend: {},
  },

  // Your default plugins for the main application.
  plugins: [],
  
  // THIS IS THE MAGIC PART:
  // We are loading the "webcrumbs" theme as a preset.
  presets: [
    {
      // All of the configuration from the new file will be applied...
      ...require('./src/tailwind-webcrumbs.config.js'),
      // ...but ONLY to elements that are inside a parent with the class 'theme-webcrumbs'.
      // This is a more robust way than using 'important'.
      plugins: [
        plugin(function({ addVariant }) {
          addVariant('theme-webcrumbs', '.theme-webcrumbs &');
        }),
      ],
    },
  ],
};