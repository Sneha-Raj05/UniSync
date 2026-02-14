import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true }, 
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    registrationId: { type: String, required: true, trim: true },
    status: { type: String, enum: ["Pending", "Paid"], default: "Pending", required: true },
    registeredAt: { type: Date, default: Date.now }
});

registrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

const Registration = mongoose.models.Registration || mongoose.model("Registration", registrationSchema);
export default Registration;