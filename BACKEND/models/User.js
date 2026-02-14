import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true,
        lowercase: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    name: { 
        type: String, 
        default: "" 
    }, 
    branch: { 
        type: String, 
        default: "" 
    }, 
    profilePic: { 
        type: String, 
        default: "" 
    }, 
    theme: { 
        type: String, 
        enum: ['light', 'dark'], 
        default: 'light' 
    },
    role: { 
        type: String, 
        enum: ['user', 'organizer'], 
        default: 'user' 
    }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;