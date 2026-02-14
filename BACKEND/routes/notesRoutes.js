import express from "express";
import Note from "../models/Notes.js";
import multer from "multer";
import path from "path";
import fs from "fs"; 
import { fileURLToPath } from 'url';
import auth from '../middleware/auth.js'; 
import mongoose from "mongoose";


const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '..', 'uploads');
        
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 50 },
});


router.put("/:id", auth, async (req, res) => {
    try {
        const { title, description, subject } = req.body;
        const query = { _id: req.params.id, userId: req.userId }; 

        const updatedNote = await Note.findOneAndUpdate(
            query,
            { title, description, subject },
            { new: true, runValidators: true }
        );

        if (!updatedNote) {
            return res.status(404).json({ message: "Note not found or unauthorized to edit" });
        }
        res.json({ message: "Note updated successfully", note: updatedNote });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete("/:id", auth, async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, userId: req.userId }); 
        
        if (!note) {
            return res.status(404).json({ message: "Note not found or unauthorized" });
        }
        

    if (note.filePath) {
    const fullFilePath = path.join(__dirname, '..', '..', note.filePath); 
    if (fs.existsSync(fullFilePath)) { fs.unlinkSync(fullFilePath); }
}
        
        await Note.deleteOne({ _id: req.params.id, userId: req.userId });
        res.json({ message: "Note and file deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Delete failed: " + error.message });
    }
});

router.get("/", auth, async (req, res) => {
    try {
       
        if (!req.userId) {
            return res.status(401).json({ message: "User not identified" });
        }

        const notes = await Note.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/", auth, upload.single('noteFile'), async (req, res) => {
    const { title, description, subject } = req.body;
    
    if (!title || !subject) {
        if (req.file) {
             fs.unlinkSync(req.file.path); 
        }
        return res.status(400).send({ message: 'Title and Subject are required!' });
    }
    
    if (!req.file) {
        return res.status(400).send({ message: 'File is required for note upload.' });
    }

    try {
        const newNote = new Note({ 
            userId: req.userId,
            title, 
            description, 
            subject,
            filePath: path.join('uploads', req.file.filename),
            originalFileName: req.file.originalname 
        });
        
        const savedNote = await newNote.save();
        res.status(201).json(savedNote);
        
    } catch (error) {
        if (req.file) {
             fs.unlinkSync(req.file.path);
        }
        res.status(400).json({ message: error.message });
    }
});

export default router;
