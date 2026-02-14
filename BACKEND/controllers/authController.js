import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const signup = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({ 
            username, 
            email, 
            password,
            role: 'user' 
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const payload = { userId: user.id, role: user.role }; 
        
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ 
            token, 
            message: 'User registered successfully',
            user: {
                 _id: user.id,
                 username: user.username,
                 role: user.role 
            } 
        });

    } catch (error) {
        console.error('Signup Error:', error.message);
        res.status(500).send('Server error during registration');
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials or user does not exist' }); 
        }
        
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials or incorrect password' });
        }
        const payload = { userId: user.id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ 
            token, 
            message: 'Login successful!',
            user: { 
                _id: user.id, 
                username: user.username, 
                role: user.role, 
            }
        });

    } catch (error) {
        console.error('Login Error:', error.message);
        res.status(500).send('Server error during login');
    }

};
