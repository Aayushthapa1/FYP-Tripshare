import app from "./app.js";
import cloudinary from "./config/cloudinaryConfig.js";
import _config from "./utils/config.js";
import connectToDB from "./utils/connectToDB.js";


import setupSocketServer from "./utils/setupSocketServer.js";
import { setupChatHandlers } from "./utils/SocketChat.js";

// We no longer need to import { Server } from "socket.io" here
// because that's done inside "setupSocketServer".
import http from "http";

// 1) Pull out "port" from our config
const { port } = _config;
console.log(`Port: ${port}`);
let io = null; 
// 4) Test Cloudinary connection
export const testCloudinaryConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log("Cloudinary connection successful:", result);
    return true;
  } catch (error) {
    console.error("Cloudinary connection failed:", error);
    return false;
  }
};

// 5) Start the server
const startServer = async () => {
  try {
    // A) Connect to DB and verify Cloudinary
    await connectToDB();
    await testCloudinaryConnection();

    const server = http.createServer(app);

    io = setupSocketServer(server);

    app.use((req, res, next) => {
      req.io = io;
      next();
    });


    // F) Finally, listen on the specified port
    server.listen(port, () => {
      console.log(`🚀 Server running on port ${port}...`);
    });
  } catch (error) {
    console.error("❌ Error starting the server:", error);
    process.exit(1);
  }
};

// 6) Execute our startServer function
startServer();

// 7) Export "io" if you want your controllers to import it directly
export { io };