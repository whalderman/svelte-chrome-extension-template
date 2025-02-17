# Svelte Chrome Extension Template

Creating Chrome Extensions can be a bit rough to set up, hopefully this repo can help with that initial hurdle. It isn't perfect, so if you have any questions or improvements, please feel free to [start a discussion](https://github.com/whalderman/svelte-chrome-extension-template/discussions) or [submit an issue](https://github.com/whalderman/svelte-chrome-extension-template/issues).

## Scripts

- `dev:serve`: Start a development server using Vite.
- `dev:build:watch`: Build the project in development mode and watch for changes.
- `dev:build`: Build the project in development mode.
- `build`: Build the project for production.
- `zip`: Create a zip file of the distribution directory.
- `buildzip`: Build the project and create a zip file.
- `check`: Run type checking using Svelte Check.
- `check:watch`: Run type checking in watch mode.
- `lint`: Check the code formatting using Prettier.
- `format`: Format the code using Prettier.

## Debugging

Press `F5`, or:

1. Run `dev:build:watch` to build the project in development mode and watch for changes.
1. Open Chrome and go to chrome://extensions/.
1. Enable "Developer mode" and click "Load unpacked".
1. Select the dist directory from this project.
1. The extension should now be loaded and ready for debugging.
1. Run `dev:serve` to start the development server.
1. Open Chrome and go to [http://localhost:12333].

## Building

1. Run `buildzip` to build the project and zip (compress) it for distribution.
