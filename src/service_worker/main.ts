import "./connection/listener";

async function inject_scripts(tab_id: number) {
	try {
		await chrome.scripting.executeScript({
			target: {
				tabId: tab_id,
				allFrames: true,
			},
			files: ["./content_script.js"], // path when bundled
		});
	} catch (e) {
		console.error(e);
	}
}

async function inject_styles(tab_id: number) {
	try {
		await chrome.scripting.insertCSS({
			target: {
				tabId: tab_id,
				allFrames: true,
			},
			files: ["./assets/injected-styles.css"], // path when bundled
		});
	} catch (e) {
		console.error(e);
	}
}

const required_permissions: chrome.permissions.Permissions = {
	permissions: ["scripting"],
	origins: ["<all_urls>"],
};

chrome.action.onClicked.addListener(analyze_tab);
async function analyze_tab(tab: chrome.tabs.Tab) {
	if (!tab.id) {
		throw new Error("tab has no id");
	}
	const permitted = await chrome.permissions.request(required_permissions);
	if (!permitted) {
		return;
	}
	inject_styles(tab.id).catch((e) => {
		throw new Error(`style injection failed: ${e}`);
	});
	inject_scripts(tab.id).catch((e) => {
		throw new Error(`script injection failed: ${e}`);
	});
}
