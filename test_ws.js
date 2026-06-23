import WebSocket from "ws";
const ws = new WebSocket("ws://localhost:5173/ws/vocal/");
ws.on("open", () => { console.log("CONNECTED"); ws.close(); });
ws.on("error", (e) => console.error("ERROR", e));
ws.on("close", () => console.log("CLOSED"));
