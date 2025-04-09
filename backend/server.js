import http from "http";
import app from "./app.js";
import _config from "./utils/config.js";
import connectToServices from "./startup/connectToServices.js";
import setupSocketServer from "./utils/setupSocketServer.js";
import setupAppRoutes from "./startup/setupAppRoutes.js";

const { port } = _config;

// Create HTTP server
const server = http.createServer(app);

const startServer = async () => {
  try {
    // Connect to database and other external services
    await connectToServices(); // DB + Cloudinary

    // Initialize socket server and store returned reference
    const { io, cleanup } = setupSocketServer(server);

    // Store io instance globally for use in controllers
    global.io = io;

    // Make createSystemNotification available to socket handlers
    if (global.notificationController) {
      global.createSystemNotification =
        global.notificationController.createSystemNotification;
    }

    // Setup all API routes after socket initialization
    setupAppRoutes(app);

    // Start the server
    server.listen(port, () => {
      console.log(`🚀 Server running on port ${port}...`);
      console.log(`📱 Socket.IO server active and handling real-time events`);
    });

    // Setup graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM signal received: closing HTTP server");
      // Run socket cleanup
      if (cleanup) cleanup();
      // Close server
      server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error);
    console.error(error.stack);
    process.exit(1);
  }
};

// Start the server
startServer();
