import { compare_languages } from "./analyzers/text_content";

chrome.runtime.onConnect.addListener(handle_on_connect);

function handle_on_connect(port: chrome.runtime.Port): void {
	if (port.name !== "seodin") {
		console.error("Unknown connection from port with name", port.name);
	}
	port.onMessage.addListener(handle_port_msg);
	port.onMessage.addListener((msg) => {
		console.log("Got message from content script:", msg);
	});
}

function handle_port_msg(msg: unknown, port: chrome.runtime.Port): void {
	if (!is_msg_with_fn_name(msg)) {
		console.error(
			'Expected object with "fn" in passed worker message, got:',
			msg,
		);
		return;
	}
	handle_work_request(msg, port);
}

function is_msg_with_fn_name(msg: unknown): msg is KnownRequestMessage {
	return (
		typeof msg === "object" &&
		msg !== null &&
		"fn" in msg &&
		typeof msg.fn === "string" &&
		is_known_fn_name(msg.fn)
	);
}

function is_known_fn_name(
	fn_name: string,
): fn_name is keyof typeof worker_fn_by_name {
	return fn_name in worker_fn_by_name;
}

const worker_fn_by_name: {
	[Fn in keyof MyExtension.WorkerFnMap]: MyExtension.WorkerFnMap[Fn]["handler"];
} = {
	compare_languages,
} as const;

function handle_work_request(
	msg: KnownRequestMessage,
	port: chrome.runtime.Port,
) {
	worker_fn_by_name[msg.fn](msg, port);
}

type MessageResponderMap = typeof worker_fn_by_name;

type KnownRequestMessage<
	K extends keyof MessageResponderMap = keyof MessageResponderMap,
> = MyExtension.RequestMessageFor<K>;

declare global {
	namespace MyExtension {
		interface RequestResponseParameters<
			RequestParameters extends object,
			ResponseParameters extends object,
		> {
			/** Parameters sent from the content script to the service worker. */
			request_params: RequestParameters;
			/** Results received by the content script from the service worker. */
			response_params: ResponseParameters;
		}

		/**
		 * Every worker request must contain a `msg_id` that is then sent back
		 * to the content script in order to map the response back to its
		 * Promise resolver.
		 */
		type WithMsgId<T> = T & {
			msg_id: string;
		};
		type WorkerFnName = keyof MessageResponderMap;

		type RequestParamsFor<Fn extends WorkerFnName> =
			MyExtension.WorkerFnMap[Fn]["request_params"];
		type RequestMessageFor<Fn extends WorkerFnName> = WithMsgId<
			RequestParamsFor<Fn>
		>;
		type KnownRequestMessageParams<K extends WorkerFnName = WorkerFnName> =
			MyExtension.RequestParamsFor<K>;

		type ResponseParamsFor<Fn extends WorkerFnName> =
			MessageMap[Fn]["response_params"];
		type ResponseMessageFor<Fn extends WorkerFnName> = WithMsgId<
			ResponseParamsFor<Fn>
		>;
		type KnownResponseMessage<K extends WorkerFnName = WorkerFnName> =
			MyExtension.ResponseMessageFor<K>;

		type MessageMap = MyExtension.WorkerFnMap & {
			[Fn in WorkerFnName]: {
				request_params: {
					fn: Fn;
				};
			};
		};
	}
}
