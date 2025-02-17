import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

/**
 * License banner to be added to the top of your extension's scripts.
 * Replace with whatever license you wish to use.
 */
const license_banner = `/*!
Copyright {{YOUR_NAME_OR_COMPANY}}

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/`;

export default defineConfig(({ mode }) => {
	// mode can be set with '--mode' flag
	const dev = mode === "development";
	const icon_path = "assets/pin.png";
	const service_worker_name = "service_worker";
	const content_script_name = "content_script";
	const version = "0.0.1";
	const minimum_chrome_version = "119";

	/** @type {chrome.runtime.ManifestV3} */
	const manifest = {
		manifest_version: 3,
		name: "__MSG_extension_name__",
		short_name: "__MSG_extension_short_name__",
		description: "__MSG_extension_description__",
		version,
		version_name: version,
		default_locale: "en",
		icons: {
			16: icon_path,
			32: icon_path,
			48: icon_path,
			128: icon_path,
		},
		author: {
			email: "your_email@any_domain.tld",
		},
		optional_permissions: ["scripting"],
		optional_host_permissions: ["<all_urls>"],
		background: {
			service_worker: `${service_worker_name}.js`,
			type: "module",
		},
		minimum_chrome_version,
		action: {
			default_icon: icon_path,
		},
		/**
		 * Remove the following if scripts are bundled together.
		 */
		web_accessible_resources: [
			{
				matches: ["<all_urls>"],
				resources: ["*.js"],
			},
		],
	};

	return {
		appType: "custom",
		plugins: [
			svelte({
				compilerOptions: {
					runes: true,
					dev: dev,
					css: "injected",
					modernAst: true,
				},
				prebundleSvelteLibraries: true,
			}),
			{
				// This plugin writes the manifest.json file to the output directory.
				name: "Chrome Extension Manifest",
				async writeBundle(output_options) {
					if (!output_options.dir) {
						throw new Error("No 'dir' parameter provided in output options!");
					}
					const path = resolve(__dirname, output_options.dir, "manifest.json");
					const contents = JSON.stringify(manifest);
					await writeFile(path, contents);
				},
			},
		],
		build: {
			lib: {
				entry: {
					[content_script_name]: resolve(
						__dirname,
						"src/content_scripts/main.ts",
					),
					[service_worker_name]: resolve(
						__dirname,
						"src/service_worker/main.ts",
					),
				},
				formats: ["es"],
			},
			// inline sourcemaps during development for easier debugging
			// (sourcemaps as sidecar files are not supported in Chromium browsers last I checked)
			sourcemap: dev ? "inline" : false,
			rollupOptions: {
				output: {
					entryFileNames: "[name].js",
					chunkFileNames: "[name].js",
					assetFileNames: "[name].[ext]",
					banner: (chunk) => {
						if (chunk.fileName.includes("node_modules")) {
							// Don't add a banner to third-party code.
							return "";
						}
						// Add a license header to the top of your scripts.
						return license_banner;
					},
				},
			},
			target: `chrome${minimum_chrome_version}`,
			minify: !dev,
			cssMinify: !dev,
			assetsInlineLimit: 0, // don't inline any assets, everything is already stored locally in the extension
		},
		esbuild: {
			// drop any console.* methods when not building for development
			drop: !dev ? ["console"] : [],
			// drop any code labeled with "dev:" when not building for development
			dropLabels: !dev ? ["dev"] : [],
		},
	};
});
