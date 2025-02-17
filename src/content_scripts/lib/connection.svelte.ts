import { get_message } from "../../shared/get_message";

let port: null | chrome.runtime.Port = null;

function nullify_port(disconnected_port: chrome.runtime.Port) {
	console.log("Service worker port disconnected.", { port: disconnected_port });
	port = null;
}

function get_port() {
	if (!port) {
		console.log("Connecting to service worker port...");
		port = chrome.runtime.connect(get_message("@@extension_id"), {
			name: "MyExtension",
		});
		port.onMessage.addListener(handle_port_msg_response);
		port.onDisconnect.addListener(nullify_port);
		dev: {
			port.onMessage.addListener((msg, port) => {
				const msg_css = msg_css_by_msg_id.get(msg.msg_id);
				if (msg_css) {
					msg_css_by_msg_id.delete(msg.msg_id);
				}
				console.log(
					"%cGot message from service worker (%s): %O",
					msg_css ?? "color:lightgray",
					msg.msg_id,
					msg,
				);
			});
		}
	}
	return port;
}

const worker_request_resolvers_by_msg_id = new Map<
	string,
	(response_msg: MyExtension.KnownResponseMessage) => void
>();

function handle_port_msg_response(
	msg: MyExtension.KnownResponseMessage,
	port: chrome.runtime.Port,
) {
	dev: if (typeof msg !== "object" || msg === null) {
		console.error("Received non-object port message:", { msg, port });
		return;
	}

	dev: if (!("msg_id" in msg)) {
		console.error("Received port message with no 'msg_id':", { msg, port });
		return;
	}

	dev: if (typeof msg.msg_id !== "string") {
		console.error("Received port message with non-string 'msg_id':", {
			msg,
			port,
		});
		return;
	}

	const resolve = worker_request_resolvers_by_msg_id.get(msg.msg_id);

	dev: if (!resolve) {
		console.error(
			"Promise resolver for message with msg_id",
			msg.msg_id,
			"does not exist!",
			{ msg, port },
		);
		return;
	}

	resolve?.(msg);
	worker_request_resolvers_by_msg_id.delete(msg.msg_id);
}

function prepare_msg_resolver<
	const MessageTypeKey extends MyExtension.WorkerFnName,
>(): {
	promise: Promise<MyExtension.ResponseMessageFor<MessageTypeKey>>;
	msg_id: string;
} {
	// almost certainly unneeded, better randomness, larger bounds
	// const msg_id = crypto
	// 	.getRandomValues(new BigUint64Array(4))
	// 	.reduce((bigint, big_uint_64) => (bigint << 64n) + big_uint_64, 0n)
	// 	.toString(36);
	const msg_id = Math.random().toString(36);
	const { promise, resolve } =
		Promise.withResolvers<MyExtension.ResponseMessageFor<MessageTypeKey>>();
	worker_request_resolvers_by_msg_id.set(msg_id, resolve);

	return { promise, msg_id };
}

const msg_css_by_msg_id = new Map<string, string>();

export async function send_worker_request<
	const RequestMessageParams extends MyExtension.KnownRequestMessageParams,
	const MessageTypeKey extends RequestMessageParams["fn"],
>(
	req_msg: RequestMessageParams,
): Promise<MyExtension.ResponseMessageFor<(typeof req_msg)["fn"]>> {
	const { promise, msg_id } = prepare_msg_resolver<MessageTypeKey>();
	const msg = { msg_id, ...req_msg };
	dev: {
		const msg_css = `color:oklch(0.8 0.2 ${Math.random() * 360})`;
		msg_css_by_msg_id.set(msg_id, msg_css);
		console.log(
			"%cSending service worker request (%s): %O",
			msg_css,
			msg.msg_id,
			msg,
		);
	}
	get_port().postMessage(msg);
	return promise;
}
