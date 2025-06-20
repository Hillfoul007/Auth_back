const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");

// POST /api/bookings
router.post("/", async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json({ message: "Booking confirmed", booking });
  } catch (error) {
    console.error("Booking save failed:", error);
    res.status(500).json({ error: "Failed to confirm booking" });
  }
});

module.exports = router;
