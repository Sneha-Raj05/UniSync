import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    fee: { 
        type: Number,
        default: 0
    },
    description: {
        type: String,
        trim: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
    },
    location: {
        type: String,
        trim: true,
    },
    image: { 
        type: String,
        required: false, 
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    }
}, {
    timestamps: true
});

const Event = mongoose.model('Event', eventSchema);
export default Event;