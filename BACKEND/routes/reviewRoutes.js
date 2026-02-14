import express from "express";
import Review from "../models/Review.js";
import auth from "../middleware/auth.js"; 

const router = express.Router();
router.get("/", async (req, res) => {
    try {

        const reviews = await Review.find().populate("user", "username").sort({ date: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/", auth, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        
        const newReview = new Review({
            user: req.userId, 
            rating,
            comment
        });

        await newReview.save();
        
        const fullReview = await Review.findById(newReview._id).populate("user", "username");
        res.status(201).json(fullReview);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete("/:id", auth, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: "Review not found" });

       
        if (review.user.toString() !== req.userId) {
            return res.status(401).json({ message: "User not authorized" });
        }

        await review.deleteOne();
        res.json({ message: "Review removed" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put("/:id", auth, async (req, res) => {
    try {
        const { rating, comment } = req.body;

        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: "Review not found" });

        if (review.user.toString() !== req.userId) {
            return res.status(401).json({ message: "User not authorized" });
        }

        review.rating = rating;
        review.comment = comment;

        await review.save();

        const updatedReview = await Review.findById(review._id).populate("user", "username");

        res.json(updatedReview);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


export default router;