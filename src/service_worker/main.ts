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

/**
 * An extra listener for the page to request an analysis of itself,
 * mainly for automated testing and other tasks.
 */
chrome.runtime.onMessage.addListener((msg, sender, send_res) => {
	if (msg !== "seodin_analyze_tab") {
		return;
	}
	if (!sender.tab) {
		throw new Error("no tab found");
	}
	analyze_tab(sender.tab)
		.then(() => {
			send_res("success");
		})
		.catch((e) => {
			throw new Error(`automated tab analysis failed: ${e}`);
		});
	return true;
});

/*
function handleInstall() {
	chrome.notifications.create(chrome.runtime.id, {
		type: 'basic',
		iconUrl: chrome.runtime.getURL('./assets/pin.png'),
		title: get_message('extensionInstalledTitle'),
		message: get_message('extensionInstalledMessage'),
		requireInteraction: false,
		silent: true,
	});
	return;
}

function handleUpdate(deets: chrome.runtime.InstalledDetails) {
	if (!deets.previousVersion) {
		throw new Error(`previousVersion is not available at update.`);
	}
	const manifest = chrome.runtime.getManifest();
	chrome.notifications.create(chrome.runtime.id, {
		type: 'basic',
		iconUrl: chrome.runtime.getURL('./assets/pin.png'),
		title: get_message('extensionUpdatedTitle'),
		message: get_message('extensionUpdatedMessage', [
			deets.previousVersion,
			manifest.version,
		]),
		requireInteraction: false,
		silent: true,
	});
}


"extensionInstalledTitle": {
	"message": "Page Analyzer Installed"
},
"extensionInstalledMessage": {
	"message": "SEOdin Page Analyzer has been installed. Visit a page and click on the extension icon to begin analyzing. If you discover any issues, please report them through our extension's support page on the Chrome Web Store."
},
"extensionUpdatedTitle": {
	"message": "Page Analyzer Updated"
},
"extensionUpdatedMessage": {
	"message": "SEOdin Page Analyzer has been updated from v$previousVersion$ to v$currentVersion$. If you discover any issues, please report them through our extension's support page on the Chrome Web Store.",
	"placeholders": {
		"previousVersion": {
			"content": "$1"
		},
		"currentVersion": {
			"content": "$2"
		}
	}
},

*/
