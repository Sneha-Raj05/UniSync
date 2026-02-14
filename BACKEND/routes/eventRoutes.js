import express from 'express';
import Event from '../models/Events.js';
import auth from '../middleware/auth.js'; 
import organizer from '../middleware/organizer.js';
import multer from 'multer';

const router = express.Router();
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/'); },
    filename: (req, file, cb) => { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ storage: storage });

router.post('/', auth, organizer, upload.single('image'), async (req, res) => {
    try {
        const { title, description, startDate, endDate, location, priority, fee } = req.body;
        const imagePath = req.file ? req.file.path : undefined; 

        const newEvent = new Event({
            userId: req.userId,
            title,
            description,
            startDate,
            endDate,
            location,
            priority,
            fee: fee || 0,
            image: imagePath 
        });

        const savedEvent = await newEvent.save();
        res.status(201).json(savedEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/', auth, async (req, res) => {
    try {
        let events;
        const role = req.userRole ? req.userRole.toLowerCase() : null; 
        if (role === 'organizer') { 
            events = await Event.find({ userId: req.userId }).sort('startDate'); 
        } else {
            events = await Event.find({}).sort('startDate'); 
        }
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/:id', auth, organizer, upload.single('image'), async (req, res) => { 
    try{
        const { title, description, startDate, endDate, location, priority, fee } = req.body;
        const updateFields = { title, description, startDate, endDate, location, priority, fee };
        if (req.file) updateFields.image = req.file.path;

        const updatedEvent = await Event.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId }, 
            updateFields,
            { new: true }
        );
        res.json(updatedEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/:id', auth, organizer, async (req, res) => { 
    try {
        await Event.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        res.json({ message: "Deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;