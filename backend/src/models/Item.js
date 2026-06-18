import mongoose from 'mongoose';
import { DEFAULT_CURRENCY, supportedCurrencies } from '../currencies.js';

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
    currency: {
      type: String,
      required: true,
      uppercase: true,
      enum: supportedCurrencies,
      default: DEFAULT_CURRENCY
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
