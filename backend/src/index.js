import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createApp } from './app.js';

dotenv.config({ path: new URL('../../.env', import.meta.url) });

const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI;

async function start() {
  if (!mongoUri) {
    throw new Error('MONGO_URI is required. Add it to the root .env file.');
  }

  await mongoose.connect(mongoUri);
  createApp().listen(port, () => {
    console.log(`API listening on port ${port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start API:', error);
  process.exit(1);
});
