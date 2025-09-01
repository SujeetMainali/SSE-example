import express, { Request, Response } from "express";
import cors from "cors";
import { INotification, NotifyResponse, SSEClient } from "./types";
import { mockNotifications } from "./mockNotifications";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Keep track of connected SSE clients with proper typing
let clients: SSEClient[] = [];

app.get("/events", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Add client with proper typing
  const clientId =
    Date.now().toString() + Math.random().toString(36).substr(2, 9);
  const client: SSEClient = {
    id: clientId,
    res,
    connectedAt: new Date(),
  };
  clients.push(client);

  // Remove client on disconnect
  req.on("close", () => {
    clients = clients.filter((c) => c.id !== clientId);
    console.log(
      `Client ${clientId} disconnected. Active clients: ${clients.length}`
    );
  });

  console.log(
    `Client ${clientId} connected. Active clients: ${clients.length}`
  );
});

/**
 * Notify Endpoint
 * Triggers a new notification event to all connected clients
 */
app.post("/notify", (req: Request, res: Response<NotifyResponse>) => {
  const payload = {
    msg: "🔔 New notification!",
    time: new Date().toISOString(),
  };

  // Send to all SSE clients
  const randomIndex = Math.floor(Math.random() * mockNotifications.length);
  const randomNotification = mockNotifications[randomIndex];
  clients.forEach((client) => {
    try {
      // Update the time to current time for real-time feel
      const notification: INotification = {
        ...randomNotification,
        time: new Date().toISOString(),
      };

      client.res.write(`data: ${JSON.stringify(notification)}\n\n`);
    } catch (error) {
      console.error(`Error sending to client ${client.id}:`, error);
      // Remove failed client
      clients = clients.filter((c) => c.id !== client.id);
    }
  });

  res.status(200).json({
    success: true,
    message: "Notification broadcasted successfully",
    data: payload,
  });
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    activeClients: clients.length,
  });
});

// Start server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`✅ SSE server running on http://localhost:${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
});
