import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    imageUrl: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ''
    },
    warrantyTerms: {
      type: String,
      trim: true,
      maxlength: 300,
      default: ''
    }
  },
  { timestamps: true }
);

export const Item = mongoose.model('Item', itemSchema);
