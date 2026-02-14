import express from "express";
import mongoose from "mongoose";
import Registration from "../models/Registration.js";
import Event from "../models/Events.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/my-events", auth, async (req, res) => {
    try {
        const registrations = await Registration.find({ userId: req.userId })
            .populate({
                path: "eventId",
                select: "title startDate fee image location" 
            })
            .sort({ registeredAt: -1 })
            .lean();

        const filtered = registrations.filter(reg => reg.eventId !== null);
        res.json(filtered);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/:eventId", auth, async (req, res) => {
    try {
        const { eventId } = req.params;
        const { fullName, email, registrationId } = req.body;
        const userId = req.userId;

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: "Event not found" });

        const alreadyRegistered = await Registration.findOne({ userId, eventId });
        if (alreadyRegistered) return res.status(400).json({ message: "Already registered" });

        const fee = Number(event.fee) || 0;
        const regStatus = fee === 0 ? "Paid" : "Pending";

        const registration = await Registration.create({
            userId, eventId, fullName, email, registrationId, status: regStatus
        });

        res.status(201).json(registration);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.patch("/confirm/:id", auth, async (req, res) => {
    try {
        const registration = await Registration.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { status: "Paid" },
            { new: true }
        );
        if (!registration) return res.status(404).json({ message: "Not found" });
        res.status(200).json({ success: true, registration });
    } catch (err) {
        res.status(500).json({ message: "Payment failed" });
    }
});

router.delete("/:id", auth, async (req, res) => {
    try {
        const deleted = await Registration.findOneAndDelete({ 
            _id: req.params.id, userId: req.userId 
        });
        if (!deleted) return res.status(404).json({ message: "Not found" });
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Unregister failed" });
    }
});

export default router;