type MessageRecord = typeof import("../../public/_locales/en/messages.json");
type MessageKey = keyof MessageRecord;
type BuiltInMessageKey =
	| "@@extension_id"
	| "@@ui_locale"
	| "@@bidi_dir" // "rtl" or "ltr"
	| "@@bidi_reversed_dir" // "rtl" or "ltr"
	| "@@bidi_start_edge" // "right" or "left"
	| "@@bidi_end_edge"; // "right" or "left"

export function get_message(
	message_id: MessageKey | BuiltInMessageKey,
	args?: string | string[],
): string {
	return chrome.i18n.getMessage(message_id, args);
}
