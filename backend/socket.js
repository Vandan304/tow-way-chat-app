import { Server as SocketIOServer } from "socket.io";
import Message from "./models/MessagesModel.js";

const setupSocket = (server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const userSocketMap = new Map();

  // Function to handle user disconnection
  const disconnect = (socket) => {
    console.log(`User disconnected: ${socket.id}`);
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        console.log(`Removed user: ${userId} from socket map.`);
        break;
      }
    }
  };

  // Function to handle message sending
  const sendMessage = async (message) => {
    try {
      const senderSocketId = userSocketMap.get(message.sender);
      const recipientSocketId = userSocketMap.get(message.recipient);

      // Save message to database
      const createdMessage = await Message.create(message);

      // Fetch the saved message with populated sender and recipient details
      const messageData = await Message.findById(createdMessage._id)
        .populate("sender", "id email firstName lastName image color")
        .populate("recipient", "id email firstName lastName image color");

      // Emit message to recipient if they are online
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("receiveMessage", messageData);
      }

      // Emit message back to sender
      if (senderSocketId) {
        io.to(senderSocketId).emit("receiveMessage", messageData);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId && userId.trim() !== "") {
      userSocketMap.set(userId, socket.id);
      console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
    } else {
      console.log(`User connected without userId - Socket ID: ${socket.id}`);
      socket.disconnect(true);
      return;
    }

    // Listen for messages
    socket.on("sendMessage", sendMessage);

    // Handle user disconnect
    socket.on("disconnect", () => disconnect(socket));
  });
};

export default setupSocket;
