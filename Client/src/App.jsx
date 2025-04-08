import router from "./Routes/Route";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import Chat from "./Chat";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Notification from "./components/RequestForm/AlertListener";
const socket = io("http://localhost:3000");

export default function App() {
  const [notificationData, setNotificationData] = useState(null);

  const userId = JSON.parse(sessionStorage.getItem("user"))?.user?.id; // or from context
  useEffect(() => {
    if (userId) {
      socket.emit("register", { userId: userId });
    }

    // Listening for real-time alert
    socket.on("new-request-alert", (data) => {
      setNotificationData(data);
      console.log("New Request Alert Received:", data);
    });

    return () => {
      socket.off("new-request-alert");
    };
  }, []);
  const apiKey = import.meta.env.VITE_AI_API_KEY;
  return (
    <>
      {notificationData && (
        <Notification
          data={notificationData}
          onClose={() => setNotificationData(null)}
          currentUserId={userId}
        />
      )}
      <Chat apiKey={apiKey} />
      <RouterProvider router={router} />
    </>
  );
}
