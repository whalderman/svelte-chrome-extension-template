import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
	return {
		appType: "mpa",
		server: {
			port: 12333,
			open: false,
			watch: {},
		},
		root: "server",
	};
});
