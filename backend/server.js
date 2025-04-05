import app from "./app.js";
import cloudinary from "./config/cloudinaryConfig.js";
import _config from "./utils/config.js";
import connectToDB from "./utils/connectToDB.js";
import ChatMessage from "./models/chatModel.js";

// Import the Socket.IO setup function (you said you created it in `utils/setupSocketServer.js`)
import setupSocketServer from "./utils/setupSocketServer.js";

// We no longer need to import { Server } from "socket.io" here
// because that's done inside "setupSocketServer".
import http from "http";

// 1) Pull out "port" from our config
const { port } = _config;
console.log(`Port: ${port}`);

// 2) (Optional) If you still want to store some global references, you can, but
// typically you'd keep your socket references in "setupSocketServer.js" or
// import { io } from here once set up.

let io = null; // We'll overwrite this once we set up the socket server

// 3) (Optional) Keep track of which users (by userId) are online, but you may have
// a separate map in setupSocketServer.js. If so, remove this or unify them.
export const onlineUsers = new Map();

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

    // B) Create the HTTP server from the Express app
    const server = http.createServer(app);

    // C) Set up Socket.IO via our "setupSocketServer"
    //    It should return an "io" instance we can export
    io = setupSocketServer(server);

    // D) (OPTIONAL) If you still have certain socket events specific
    //    to "server.js", you could do them here. Usually, they'd be in "setupSocketServer.js".
    //    For example, if you have a quick global "onConnection" or "on" logic you want right here.

    // E) Example GET route for retrieving messages in a room (if you still need it)
    app.get("/chats/:chatRoomId/messages", async (req, res) => {
      try {
        const { chatRoomId } = req.params;
        const messages = await ChatMessage.find({ chatRoomId }).sort({ createdAt: 1 });
        return res.json(messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
        return res.status(500).json({ error: "Failed to fetch messages" });
      }
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