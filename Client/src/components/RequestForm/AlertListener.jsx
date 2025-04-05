import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000"); // Backend URL

const BloodRequestAlert = ({ userId, plasmaType }) => {
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    // Join room based on userId and plasmaType
    socket.emit("joinRoom", { userId, plasmaType });

    socket.on("bloodRequest", (data) => {
      setAlertMessage(data.message);
    });

    return () => {
      socket.off("bloodRequest");
    };
  }, [userId, plasmaType]);

  return (
    <>
      {alertMessage && (
        <div className="fixed top-0 left-0 flex items-center justify-center w-full h-full bg-black bg-opacity-50 z-50">
          <div className="p-6 text-center bg-white rounded-lg shadow-lg">
            <h2 className="text-lg font-bold text-red-600">
              🚨 Plasma Request Alert! 🚨
            </h2>
            <p>{alertMessage}</p>
            <button
              className="px-4 py-2 mt-4 text-white bg-red-500 rounded"
              onClick={() => setAlertMessage("")}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BloodRequestAlert;
