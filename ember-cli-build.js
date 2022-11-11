'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

const autoprefixer = require('autoprefixer');
const tailwind = require('tailwindcss');

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    fingerprint: {
      extensions: ['js', 'css'],
    },
    postcssOptions: {
      compile: {
        cacheInclude: [/.*\.(css|scss|hbs)$/, /.tailwind\/config\.js$/],
        plugins: [
          {
            module: autoprefixer,
            options: {},
          },
          {
            module: require('postcss-import'),
            options: {
              path: ['node_modules'],
            },
          },
          {
            module: tailwind,
            options: {
              config: './app/tailwind/config.js',
            },
          },
        ],
      },
    },
  });
  return app.toTree();
};
