"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
let senderSocket = null;
let receiverSocket = null;
wss.on("connection", function connection(ws) {
    ws.on("error", console.error);
    ws.on("message", function message(data) {
        const message = JSON.parse(data);
        if (message.type === "sender") {
            console.log("sender connected");
            senderSocket = ws;
        }
        else if (message.type === "receiver") {
            console.log("receiver connected");
            receiverSocket = ws;
        }
        else if (message.type === "createOffer") {
            if (ws === senderSocket) {
                console.log("sender sent offer");
                receiverSocket === null || receiverSocket === void 0 ? void 0 : receiverSocket.send(JSON.stringify({
                    type: "createOffer",
                    sdp: message.sdp,
                }));
            }
        }
        else if (message.type === "createAnswer") {
            if (ws === receiverSocket) {
                console.log("receiver sent answer");
                senderSocket === null || senderSocket === void 0 ? void 0 : senderSocket.send(JSON.stringify({
                    type: "createAnswer",
                    sdp: message.sdp,
                }));
            }
        }
        else if (message.type === "iceCandidate") {
            if (ws === senderSocket) {
                receiverSocket === null || receiverSocket === void 0 ? void 0 : receiverSocket.send(JSON.stringify({
                    type: "iceCandidate",
                    candidate: message.candidate,
                }));
            }
            if (ws === receiverSocket) {
                senderSocket === null || senderSocket === void 0 ? void 0 : senderSocket.send(JSON.stringify({
                    type: "iceCandidate",
                    candidate: message.candidate,
                }));
            }
        }
    });
});
