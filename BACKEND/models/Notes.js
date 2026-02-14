import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  userId:{
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true, 
  },
  description: {
    type: String,
    trim: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },

  filePath: { 
    type: String,
    required: true, 
  },
  originalFileName: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true }); 

const Note = mongoose.model("Note", noteSchema);
export default Note;

