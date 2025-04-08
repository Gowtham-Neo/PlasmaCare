import { useEffect, useState } from "react";
import {
  FaTint,
  FaUserInjured,
  FaHospital,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import { io } from "socket.io-client";
import axios from "axios";
const socket = io("http://localhost:3000");

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-3">
    <span className="text-red-500 text-lg">{icon}</span>
    <span className="text-gray-300 text-sm">
      <b>{label}:</b> {value}
    </span>
  </div>
);

const Notification = ({ data, onClose, currentUserId }) => {
  const [hidden, setHidden] = useState(false);
  if (data?.requestData?.userId === currentUserId || hidden) {
    return null; // Don't render anything
  }

  useEffect(() => {
    const audio = new Audio("/random-alarm-319318.mp3");
    audio.play();

    const timer = setTimeout(() => {
      onClose();
    }, 100000);

    return () => {
      audio.pause();
      clearTimeout(timer);
    };
  }, []);
  useEffect(() => {
    socket.on("request-accepted", ({ requestId }) => {
      if (requestId === data?.requestData?.id) {
        setHidden(true);
        onClose();
      }
    });

    return () => {
      socket.off("request-accepted");
    };
  }, [data]);

  const handleAccept = async () => {
    await axios.post("/api/requestStatus/accept", {
      requestId: data?.requestData?.id,
      donorId: currentUserId,
    });

    // Optional: Navigate to Direction Page
    window.location.href = `/directions/${data?.requestData?.location}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      {/* Backdrop */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Popup */}
      <div className="relative z-10 bg-gray-900 border border-red-500 text-gray-100 shadow-2xl rounded-2xl p-6 w-[350px] animate-fadeIn flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-red-500 flex items-center gap-2">
            <FaExclamationTriangle /> Blood Request Alert
          </h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-red-500 transition"
          >
            &times;
          </button>
        </div>

        <div className="space-y-4">
          <InfoItem
            icon={<FaUserInjured />}
            label="Patient"
            value={data?.requestData?.patientName}
          />
          <InfoItem
            icon={<FaHospital />}
            label="Hospital"
            value={data?.requestData?.hospital}
          />
          <InfoItem
            icon={<FaMapMarkerAlt />}
            label="Location"
            value={data?.requestData?.location}
          />
          <InfoItem
            icon={<FaPhoneAlt />}
            label="Contact"
            value={data?.requestData?.contact}
          />
          <InfoItem
            icon={<FaTint />}
            label="Blood Group"
            value={data?.requestData?.bloodGroup}
          />
        </div>

        <button
          onClick={handleAccept}
          className="mt-4 w-full bg-red-500 hover:bg-red-600 transition py-2 rounded-xl font-bold"
        >
          Accept & Reach Patient
        </button>
      </div>
    </div>
  );
};

export default Notification;
