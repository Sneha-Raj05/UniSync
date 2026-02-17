import express from 'express';
import { signup, login } from '../controllers/authController.js';
import auth from '../middleware/auth.js';
import User from "../models/User.js";


const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password'); 
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});


router.put('/update-profile', auth, async (req, res) => {
    try {

        const { name, email, branch, profilePic, theme } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { 
                name, 
                email, 
                branch, 
                profilePic, 
                theme 
            },
            { new: true, runValidators: true } 
        ).select('-password');

        if (!updatedUser) return res.status(404).json({ message: "User not found" });

        res.json(updatedUser);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Email already exists" });
        }
        res.status(500).json({ message: "Update failed" });
    }
});


export default router;
