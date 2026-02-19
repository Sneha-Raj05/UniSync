import express from "express";
import Note from "../models/Notes.js";
import multer from "multer";
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import auth from '../middleware/auth.js'; 

const router = express.Router();

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'unisync_notes', 
        resource_type: 'auto', 
        allowed_formats: ['jpg', 'png', 'pdf', 'docx', 'txt'],
        flags: 'attachment',
        access_mode: 'public'
    },
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 10 } 
});


router.get("/", auth, async (req, res) => {
    try {
        if (!req.userId) return res.status(401).json({ message: "User not identified" });
        const notes = await Note.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.post("/", auth, upload.single('noteFile'), async (req, res) => {
    const { title, description, subject } = req.body;
    
    if (!title || !subject) {
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
            filePath: req.file.path, 
            originalFileName: req.file.originalname 
        });
        
        const savedNote = await newNote.save();
        res.status(201).json(savedNote);
        
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
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

        await Note.deleteOne({ _id: req.params.id, userId: req.userId });
        res.json({ message: "Note deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Delete failed: " + error.message });
    }
});

export default router;

