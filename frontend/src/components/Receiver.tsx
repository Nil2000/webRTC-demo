import { useEffect, useRef } from "react";

function Receiver() {
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		const socket = new WebSocket("ws://localhost:8080");
		socket.onopen = () => {
			socket.send(JSON.stringify({ type: "receiver" }));
		};

		startReceivingVideo(socket);
	}, []);

	function startReceivingVideo(socket: WebSocket) {
		const pc = new RTCPeerConnection();

		pc.ontrack = (event) => {
			console.log("ontrack", event.track);
			if (videoRef.current) {
				videoRef.current.srcObject = new MediaStream([event.track]);
				videoRef.current.play();
			}
		};

		socket.onmessage = async (event) => {
			const message = JSON.parse(event.data);
			if (message.type === "createOffer") {
				await pc.setRemoteDescription(message.sdp);
				const answer = await pc.createAnswer();
				await pc.setLocalDescription(answer);
				socket.send(
					JSON.stringify({ type: "createAnswer", sdp: pc.localDescription })
				);
			} else if (message.type === "iceCandidate") {
				pc?.addIceCandidate(message.candidate);
			}
		};
	}
	return (
		<div>
			Receiver
			<video ref={videoRef} />
		</div>
	);
}

export default Receiver;
