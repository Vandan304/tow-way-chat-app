import { createContext, useContext, useEffect, useRef } from "react";
import { useAppStore } from "../store";
import { HOST } from "../utils/constants";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socket = useRef(null);
  const { userInfo } = useAppStore();

  useEffect(() => {
    if (userInfo?.id) {
      // Ensure userInfo and userInfo.id exist
      socket.current = io(HOST, {
        withCredentials: true,
        query: { userId: userInfo.id }, // FIXED: Correct query parameter name
      });

      socket.current.on("connect", () => {
        console.log("Connected to socket server");
      });
      const handleReciveMessage = (message) => {
        const { selectedChatType, selectedChatData , addMessage} = useAppStore.getState();
        if (
          selectedChatType !== undefined &&
            (selectedChatData._id === message.sender._id ||
          selectedChatData._id === message.recipient._id)
        ) {
          console.log("message recive ",message)
            addMessage(message);

        }
      };
      socket.current.on("receiveMessage", handleReciveMessage);

      socket.current.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      return () => {
        if (socket.current) {
          socket.current.disconnect();
          console.log("Socket disconnected");
        }
      };
    }
  }, [userInfo]);

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};
