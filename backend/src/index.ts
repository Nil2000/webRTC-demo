import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let senderSocket: WebSocket | null = null;
let receiverSocket: WebSocket | null = null;

wss.on("connection", function connection(ws) {
	ws.on("error", console.error);

	ws.on("message", function message(data: any) {
		const message = JSON.parse(data);
		if (message.type === "sender") {
			console.log("sender connected");
			senderSocket = ws;
		} else if (message.type === "receiver") {
			console.log("receiver connected");
			receiverSocket = ws;
		} else if (message.type === "createOffer") {
			if (ws === senderSocket) {
				console.log("sender sent offer");
				receiverSocket?.send(
					JSON.stringify({
						type: "createOffer",
						sdp: message.sdp,
					})
				);
			}
		} else if (message.type === "createAnswer") {
			if (ws === receiverSocket) {
				console.log("receiver sent answer");
				senderSocket?.send(
					JSON.stringify({
						type: "createAnswer",
						sdp: message.sdp,
					})
				);
			}
		} else if (message.type === "iceCandidate") {
			if (ws === senderSocket) {
				receiverSocket?.send(
					JSON.stringify({
						type: "iceCandidate",
						candidate: message.candidate,
					})
				);
			} else if (ws === receiverSocket) {
				senderSocket?.send(
					JSON.stringify({
						type: "iceCandidate",
						candidate: message.candidate,
					})
				);
			}
		}
	});
});
