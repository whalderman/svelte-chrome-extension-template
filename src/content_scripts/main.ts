window.requestIdleCallback(async function init_svelte() {
	const element_id = "my-injected-extension-root";
	if (document.getElementById(element_id) !== null) {
		throw new Error("The content script has already been injected, buddy.");
	}

	console.log("Injecting content script...");

	const root = document.createElement("div");
	root.id = element_id;
	root.lang = chrome.i18n.getUILanguage();
	root.dir = chrome.i18n.getMessage("@@bidi_dir");

	document.body.appendChild(root);
	const shadow = root.attachShadow({ mode: "open" });

	const { mount } = await import("svelte");
	const { default: Main } = await import("./Main.svelte");

	console.log("Mounting Main.svelte to", shadow);
	mount(Main, {
		target: shadow,
	});
});
