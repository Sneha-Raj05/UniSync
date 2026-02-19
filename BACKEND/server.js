import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path"; 
import { fileURLToPath } from 'url'; 

import reviewRoutes from "./routes/reviewRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import notesRoutes from "./routes/notesRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import { v2 as cloudinary } from 'cloudinary';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));


app.use(cors({
  origin: "https://uni-sync-iota.vercel.app", 
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
  credentials: true
}));

app.use(async (req, res, next) => {
    await connectDB();
    next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/registrations", registrationRoutes);
app.use("/api/notes", notesRoutes); 
app.use('/api/auth', authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to UniSync Backend is LIVE!");
});
let isConnected = false; 

const connectDB = async () => {
    if (isConnected) {
        console.log("=> Using existing database connection");
        return;
    }

    console.log("=> Creating new database connection");
    try {
        const db = await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, 
        });
        
        isConnected = db.connections[0].readyState;
        console.log("Connected to MongoDB successfully");
    } catch (err) {
        console.error("MongoDB connection failed:", err.message);
        throw err; 
    }
};

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
        console.log(`Server is listening to port ${PORT}`);
    });
}

export default app; // Sabse important line Vercel ke liye





