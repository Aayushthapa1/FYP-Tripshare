import io from "socket.io-client";

const socket = io("http://localhost:3301/", { transports: ["websocket"], reconnection: true });

// 🟢 Debug: Check if connection is successful
socket.on("connect", () => {
  console.log("✅ Connected to server:", socket.id);

  // 🟢 Simulate driver going online
  const driverId = "67b873c3dc77da179505f7ed";
  socket.emit("driver-online", driverId);
  console.log(`✅ Sent 'driver-online' event for driver ${driverId}`);

  // 🟢 Simulate a passenger requesting a ride
  setTimeout(() => {
    const rideRequest = {
      driverId: driverId,
      passengerId: "6799130035e57fd23870657d",
      pickupLocation: "Kathmandu",
      dropoffLocation: "Pokhara",
    };
    socket.emit("request-ride", rideRequest);
    console.log("📩 Sent 'request-ride' event:", rideRequest);
  }, 2000); // Delay to ensure connection is established
});

// 🟢 Debug: Listen for ride requests (Driver side)
socket.on("ride-request", (data) => {
  console.log("🚖 Driver received ride request:", data);
});

// 🟢 Debug: Listen for ride status updates (Passenger side)
socket.on("ride-status", (data) => {
  console.log("📩 Passenger received ride status:", data);
});

// 🟢 Debug: Catch connection errors
socket.on("connect_error", (err) => {
  console.error("❌ Connection Error:", err.message);
});

// 🟢 Debug: Detect disconnection
socket.on("disconnect", () => {
  console.log("⚠️ Disconnected from server");
});
