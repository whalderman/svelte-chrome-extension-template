export async function compare_languages(
	msg: compare_languages.RequestMessage,
	port: chrome.runtime.Port,
): Promise<void> {
	const [prominent_lang1, prominent_lang2] = await Promise.all([
		extract_most_prominent_lang(msg.content1),
		extract_most_prominent_lang(msg.content2),
	]);

	const prominent_languages_are_equal =
		prominent_lang1.language === prominent_lang2.language;
	const is_reliable =
		prominent_lang1.is_reliable && prominent_lang2.is_reliable;

	port.postMessage({
		msg_id: msg.msg_id,
		is_reliable,
		prominent_languages_are_equal,
	} satisfies compare_languages.ResponseMessage);
}

export namespace compare_languages {
	export declare const name = "compare_languages";
	export interface RequestParams<Fn extends string = typeof name> {
		fn: Fn;
		content1: string;
		content2: string;
	}
	export type RequestMessage = MyExtension.WithMsgId<RequestParams>;
	export type ResponseParams = LanguageComparison;
	export type ResponseMessage = MyExtension.WithMsgId<ResponseParams>;
}

interface MostProminentLangDetection extends chrome.i18n.DetectedLanguage {
	is_reliable: boolean;
}

interface LanguageComparison {
	prominent_languages_are_equal: boolean;
	is_reliable: boolean;
}

declare global {
	namespace MyExtension {
		interface WorkerFnMap {
			[compare_languages.name]: {
				handler: typeof compare_languages;
				request_params: compare_languages.RequestParams;
				response_params: compare_languages.ResponseParams;
			};
		}
	}
}

async function extract_most_prominent_lang(
	content: string,
): Promise<MostProminentLangDetection> {
	const lang_res = await chrome.i18n.detectLanguage(content);
	const most_prominent_lang: MostProminentLangDetection = {
		language: "und",
		percentage: 0,
		is_reliable: lang_res.isReliable,
	};
	for (const detected_lang of lang_res.languages) {
		if (detected_lang.percentage > most_prominent_lang.percentage) {
			most_prominent_lang.language = detected_lang.language;
			most_prominent_lang.percentage = detected_lang.percentage;
		}
	}
	return most_prominent_lang;
}
