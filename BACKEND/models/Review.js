import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    date: { type: Date, default: Date.now }
});


const Review = mongoose.model('Review', ReviewSchema);
export default Review;