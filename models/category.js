import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Please enter a category'],
  },
});

export default mongoose.model('Category', categorySchema);
