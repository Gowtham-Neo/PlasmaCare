const express = require("express");
const { Request, User, UserStatus,RequestStatus } = require("../models");
const { Op } = require("sequelize");
const { sendSMS, sendEmail } = require("../utils/smsService");
const { Server } = require("socket.io");
const http = require("http");
const app = express();
const server = http.createServer(app);

const router = express.Router();
const { socketHandler, onlineUsers } = require("../socket/socketHandler");

const plasmaCompatibility = {
  AB: ["A", "B", "AB", "O"],
  O: ["O"],
  A: ["A", "AB"],
  B: ["B", "AB"],
};

// Haversine Formula for Distance Calculation
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Handle Request Submission
const axios = require("axios");

router.post("/create/:userId", async (req, res) => {
  const { userId } = req.params;
  const io = req.app.get("io");

  try {
    const {
      patientName,
      bloodGroup,
      location, // String (e.g., "New York, USA")
      contact,
      requesterName,
      relation,
      hospitalName,
      numberOfPatients,
      urgency,
      message,
    } = req.body;

    // Convert location string to latitude & longitude
    const getCoordinates = async (address) => {
      const API_URL = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}`;
      const response = await axios.get(API_URL);
      if (response.data.length === 0) throw new Error("Invalid location");
      return {
        latitude: parseFloat(response.data[0].lat),
        longitude: parseFloat(response.data[0].lon),
      };
    };

    const { latitude, longitude } = await getCoordinates(location);

    // Create new blood request
    const newRequest = await Request.create({
      patientName,
      bloodGroup,
      location,
      contact,
      requesterName,
      relation,
      hospitalName,
      numberOfPatients,
      urgency: urgency || "Normal",
      message,
      userId,
    });

    const nearbyUsers = await UserStatus.findAll({ where: { isOnline: true } });

    const eligibleUsers = nearbyUsers.filter(
      (user) =>
        getDistance(latitude, longitude, user.latitude, user.longitude) <= 30
    );
    console.log("eligible", eligibleUsers);

    onlineUsers.forEach(({ socketId }, onlineUserId) => {
      io.to(socketId).emit("new-request-alert", {
        message: "New Blood Request Raised!",
        requestData: newRequest,
      });
    });

    const allUsers = await User.findAll({
      attributes: ["email", "phone_number"],
    });

    allUsers.forEach((user) => {
      sendEmail(
        user.email,
        "Urgent Blood Request",
        `Urgent Blood Request! ${bloodGroup} needed at ${
          hospitalName || location
        }. 
        Patient: ${patientName}, Requested by: ${requesterName} (${relation}). 
        Urgency: ${urgency}. Number of Patients: ${numberOfPatients}. 
        Contact: ${contact}. Message: ${message}`
      );
    });

    res.status(200).json({
      message: "Request Created & Alerts Sent!",
      eligibleUsers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.post('/accept', async (req, res) => {
  const { requestId, donorId } = req.body;

  try {
    const requestStatus = await RequestStatus.findOne({
      where: { requestId, status: 'Pending' }
    });

    if (!requestStatus) {
      return res.status(400).json({ message: 'Request Already Accepted or Invalid' });
    }

    await requestStatus.update({
      donorId,
      status: 'Accepted'
    });

    // Emit to all users via socket
    req.io.emit('request-accepted', { requestId, donorId });

    res.status(200).json({ message: 'Request Accepted Successfully' });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server Error' });
  }
});
module.exports = router;
