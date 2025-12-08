# Vite Plugin ScriptCat Require Self

English / [中文](./README-zh.md)

## Features

Automatically injects references into UserScript headers for Web Script like TamperMonkey or ScriptCat, referencing the locally built file: `// @require <dist-bundle.js>`.

## Installation

```bash
npm install @yiero/vite-plugin-scriptcat-require-self -D
# or
yarn add @yiero/vite-plugin-scriptcat-require-self -D
# or
pnpm add @yiero/vite-plugin-scriptcat-require-self -D
```

## Configuration

| Parameter  | Type      | Description                                                  | Default |
| ---------- | --------- | ------------------------------------------------------------ | ------- |
| `isInsert` | `boolean` | Whether to inject references, can be controlled via **environment variables** | `true`  |

## Usage

Add the plugin to your `vite.config.js`:

```ts
import { defineConfig } from 'vite'
import scriptCatRequireSelf from '@yiero/vite-plugin-scriptcat-require-self'

export default defineConfig( ( env ) => {
	/*
	* Get the current build environment
	* */
	const isDevelopment = env.mode === 'development';
    plugins: [
        // Other plugins...
        
        // If in development environment, outputs true and automatically injects local file reference
        // Otherwise outputs false and the plugin does nothing
        scriptCatRequireSelf( isDevelopment )
	],	
})
```

---

Add to your `package.json`:

```json
{
    // Other configurations...
	"scripts": {
		"dev": "vite build --mode development",
		"build": "vite build --mode production",
        
        // Other commands...
	}
}
```

## How It Works

The plugin automatically:

1. Identifies UserScript files by detecting the `// ==UserScript==` marker
2. Generates the absolute file URL for the output script
3. Checks if a self-referencing `@require` directive already exists
4. Injects `// @require <file-URL>` before the closing `// ==/UserScript==` marker (if it doesn't exist)

**Before processing:**

```js
// ==UserScript==
// @name        My Script
// @namespace   https://example.com  
// @version     1.0
// ==/UserScript==

console.log('Hello from UserScript!');
```

**After building:**

```js
// ==UserScript==
// @name        My Script
// @namespace   https://example.com  
// @version     1.0
// @require     file:///project-path/dist/script.js
// ==/UserScript==

console.log('Hello from UserScript!');
```



## Contributing

Contributions are welcome! Please submit issues or PRs via [GitHub](https://github.com/your-username/vite-plugin-scriptcat-require-self).

## License

GPL-3 © [AliubYiero](https://github.com/AliubYiero)
