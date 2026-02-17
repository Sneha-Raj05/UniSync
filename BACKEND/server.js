import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import reviewRoutes from "./routes/reviewRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import notesRoutes from "./routes/notesRoutes.js";
import path from "path"; 
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import { fileURLToPath } from 'url'; 

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors({
  origin: "https://uni-sync-iota.vercel.app", 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.options("*", cors());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/registrations", registrationRoutes);

app.use("/api/notes", notesRoutes); 
app.use('/api/auth', authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/reviews", reviewRoutes);

console.log("Connecting to:", process.env.MONGO_URL ? "URL Loaded" : "URL is EMPTY");

const mongoURI = process.env.MONGO_URL;
console.log("Attempting to connect with URI:", mongoURI ? "URI exists" : "URI IS UNDEFINED");

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, 
  }) 
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
  });


app.get("/", (req, res) => {
  res.send("Welcome to UniSync Backend");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is listening to port ${PORT}`);

});




