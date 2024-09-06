import { useEffect, useState } from "react";

function Sender() {
	const [socket, setSocket] = useState<WebSocket | null>(null);

	useEffect(() => {
		const socket = new WebSocket("ws://localhost:8080");
		if (!socket) setSocket(socket);
		socket.onopen = () => {
			socket.send(JSON.stringify({ type: "sender" }));
		};
		setSocket(socket);
	}, []);

	async function startSendingVideo() {
		if (!socket) return;
		const pc = new RTCPeerConnection();

		pc.onnegotiationneeded = async () => {
			console.log("onnegotiationneeded");
			const offer = await pc.createOffer();
			await pc.setLocalDescription(offer);
			socket?.send(
				JSON.stringify({ type: "createOffer", sdp: pc.localDescription })
			);
		};

		pc.onicecandidate = (event) => {
			console.log("onicecandidate", event.candidate);
			if (event.candidate) {
				socket?.send(
					JSON.stringify({ type: "iceCandidate", candidate: event.candidate })
				);
			}
		};

		socket.onmessage = async (event) => {
			const message = JSON.parse(event.data);
			if (message.type === "createAnswer") {
				await pc.setRemoteDescription(message.sdp);
			} else if (message.type === "iceCandidate") {
				pc.addIceCandidate(message.candidate);
			}
		};

		//use this for webcam
		// const stream = await navigator.mediaDevices.getUserMedia({ video: true });
		// use this for screen sharing
		const stream = await navigator.mediaDevices.getDisplayMedia({
			video: true,
		});
		pc.addTrack(stream.getVideoTracks()[0]);
	}
	return (
		<div>
			Sender
			<button onClick={startSendingVideo}>Start Video</button>
		</div>
	);
}

export default Sender;
