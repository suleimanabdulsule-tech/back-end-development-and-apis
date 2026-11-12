import http from "node:http";
import { readFile } from "node:fs/promises";
import { WebSocket, WebSocketServer } from "ws";

const PORT = 3001;
const publicFiles = {
  "/": ["index.html", "text/html; charset=utf-8"],
  "/script.js": ["script.js", "text/javascript; charset=utf-8"],
};

const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url, "http://localhost").pathname;

  if (req.method !== "GET" || !Object.hasOwn(publicFiles, pathname)) {
    res.writeHead(404).end("Not Found");
    return;
  }

  const [filename, contentType] = publicFiles[pathname];

  try {
    const body = await readFile(new URL(`./public/${filename}`, import.meta.url));
    res.writeHead(200, { "Content-Type": contentType }).end(body);
  } catch {
    res.writeHead(500).end("Could not load chat files.");
  }
});

const wss = new WebSocketServer({ server });

function broadcast(message) {
  const payload = JSON.stringify(message);

  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

wss.on("connection", (socket, req) => {
  const username = new URL(req.url, "http://localhost")
    .searchParams.get("username") || "Anonymous";

  socket.on("error", (error) => {
    console.error("WebSocket client error:", error.message);
  });

  broadcast({ type: "system", text: `${username} joined` });

  socket.on("message", (rawMessage) => {
    let message;

    try {
      message = JSON.parse(rawMessage.toString());
    } catch {
      return;
    }

    if (typeof message?.username !== "string" || typeof message.text !== "string") {
      return;
    }

    broadcast({ type: "chat", username: message.username, text: message.text });
  });

  socket.on("close", () => {
    broadcast({ type: "system", text: `${username} left` });
  });
});

server.listen(PORT, () => {
  console.log(`Chat server running at http://localhost:${PORT}`);
});
