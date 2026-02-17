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

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Sahi CORS setup
app.use(cors({
  origin: "https://uni-sync-iota.vercel.app", 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Yahan se app.options wali line hata di gayi hai taaki PathError na aaye

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/registrations", registrationRoutes);
app.use("/api/notes", notesRoutes); 
app.use('/api/auth', authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to UniSync Backend is LIVE!");
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }) 
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => console.error("MongoDB connection failed:", err.message));

// Vercel compatibility ke liye check
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
        console.log(`Server is listening to port ${PORT}`);
    });
}

export default app; // Sabse important line Vercel ke liye
